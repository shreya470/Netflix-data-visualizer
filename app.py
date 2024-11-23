from flask import Flask, render_template, jsonify, request
import plotly.graph_objects as go
import pandas as pd
import os

app = Flask(__name__, template_folder='templates')
# Route to serve the data as JSO

@app.route('/data')
def get_data():
    # Load the CSV file from the 'data' directory
    df = pd.read_excel('data/netflix_titles.xlsx')
    
# Group by release year and type and count the occurrences
    grouped = df.groupby(['release_year', 'type']).size().reset_index(name='count')
    response = grouped.to_dict(orient='records')        
    return jsonify(response)

@app.route('/ratings')
def get_ratings():
    # Load the CSV file from the 'data' directory
    df = pd.read_excel('data/netflix_titles.xlsx')

    # Group by rating and count occurrences
    grouped = df.groupby('age_certification').size().reset_index(name='count')
    response = grouped.to_dict(orient='records')
    return jsonify(response)

@app.route('/genres')
def get_genres():
    # Load the .xlsx file (or .csv if you prefer)
    df = pd.read_excel('data/netflix_titles.xlsx')  # Replace with .csv if needed

    # Group by 'main_genre' and count occurrences
    grouped = df.groupby('main_genre').size().reset_index(name='count')

    # Convert to JSON format
    response = grouped.to_dict(orient='records')

    return jsonify(response)

@app.route('/runtime-data')
def runtime_data():
    df = pd.read_excel('data/netflix_titles.xlsx')
    # Group by runtime and count the number of titles
    bins = [0, 30, 60, 90, 120, 150, 180, float('inf')]  # Adjust bins as needed
    labels = ['0-30', '31-60', '61-90', '91-120', '121-150', '151-180', '180+']

    # Create a new column with runtime ranges
    df['runtime'] = pd.cut(df['runtime'], bins=bins, labels=labels, right=True)
    grouped = (df.groupby('runtime')['title']
           .count()
           .reset_index()
           .rename(columns={'title': 'count'}))
    
    
    response = grouped.to_dict(orient='records')
    return jsonify(response)
    
   
    # grouped = (df.groupby('runtime')['title'].count().reset_index().rename(columns={'title': 'count'})
    # )
    # response = grouped.to_dict(orient='records')
    # print(grouped)
    # return jsonify(response)
    
 
@app.route('/years')
def get_years():
    df = pd.read_excel('data/netflix_titles.xlsx')
    years = df['release_year'].dropna().unique()
    response = sorted(years.tolist())
    return jsonify(response)



@app.route('/imdb-data/<int:year>')
def imdb_data(year):
    # Load both relevant sheets
    description_df = pd.read_excel('data/netflix_titles.xlsx', sheet_name='description')
    imdb_score_df = pd.read_excel('data/netflix_titles.xlsx', sheet_name='imdb_score')
    
    # Ensure the column names align 
    # print("Description columns:", description_df.columns)
    # print("IMDB Score columns:", imdb_score_df.columns)

    # # Merge data based on a common key, if available (e.g., title or title_id)
    # Assuming `title_id` is a common column
    merged_df = pd.merge(description_df, imdb_score_df, on='title_id', how='inner')

    # Filter and process data
    filtered = merged_df[merged_df['release_year'] == year][['title', 'imdb_score']].dropna()

    # Convert to JSON and return
    return filtered.to_json(orient='records')



@app.route('/')
def index():
    # Load the description sheet from the Excel file
    description_df = pd.read_excel('data/netflix_titles.xlsx', sheet_name='description')

    # Group by 'production_countries' and count occurrences
    country_counts = description_df['production_countries'].value_counts().reset_index()
    country_counts.columns = ['Country', 'Count']

    # Create the Choropleth map
    fig = go.Figure(go.Choropleth(
        locations=country_counts['Country'],  # Valid country names
        z=country_counts['Count'],           # Data for shading
        locationmode='country names',        # Must match 'Country' values
        text=country_counts['Country'],      # Display country names in hover
        hovertemplate='<b>%{text}</b><br>Count: %{z}<extra></extra>',  # Hover info
        coloraxis="coloraxis",               # Use color axis for gradient
    ))

    # Customize layout
    fig.update_layout(
        title_text='Country-wise Data',
        geo=dict(
            showframe=False,
            projection_type='equirectangular'
        ),
        coloraxis=dict(
            colorscale='Viridis',  # Adjust color scale as needed
            colorbar=dict(title='Count')
        )
    )

  
    plot_html = fig.to_html(full_html=False)
    #print(plot_html)  # This will help us check the HTML output in the terminal

    # Render the figure as HTML
    return render_template('index.html', plot=plot_html)

if __name__ == '__main__':
    app.run(debug=True)
