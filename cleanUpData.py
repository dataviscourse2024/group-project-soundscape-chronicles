import pandas as pd
import csv
import json

#checking my data for missing data (API didn't return anything for some songs)
def check_for_missing_data():
    top_100_df = pd.read_csv('data/charts.csv')

    top_100_df['date'] = pd.to_datetime(top_100_df['date'])

    top_100_df = top_100_df[top_100_df['date'].dt.year >= 2000]

    top_100_df = top_100_df[top_100_df['date'].dt.day <= 7]

    first_range = (top_100_df['date'] >= '2000-01-01') & (top_100_df['date'] <= '2007-04-30')

    top_100_df = top_100_df[first_range]

    nicole_data_df = pd.read_csv('data/nicoledata.csv')

    missing_data = top_100_df[~top_100_df['song'].isin(nicole_data_df['song'])]

    #date,rank,song,artist,last-week,peak-rank,weeks-on-board,label
    for index, data in missing_data.iterrows():
        print(str(data['date']) + "," + str(data['rank']) + "," + data['song'] + "," + data['artist'] + "," + str(data['last-week']) + "," + str(data['peak-rank']) + "," + str(data['weeks-on-board']) + "2")

#merging our data collection
def merge_csvs():
    #Some code to run later once all 3 of us have gotten our data
    #this chunk atwill take all of the data we have after collection, and combine it into 1 legible file.
    #make sure to rename the 3 data files.


    # Your mapping dictionary
    label_mapping = {'0': 'sad', '1': 'happy', '2': 'energetic', '3': 'calm'}

    # Function to convert and map labels
    def convert_labels(df):
        # Map numeric labels to text labels
        df['label'] = df['label'].replace(label_mapping)
        return df


    df1 = pd.read_csv('oldda/data_1986_88_filled.csv')
    df1['date'] = pd.to_datetime(df1['date'])
    df5 = pd.read_csv('olddata/data89_data89.csv')
    df5['date'] = pd.to_datetime(df5['date'])
    df2 = pd.read_csv('olddata/spotify_data_1990_1993.csv')
    df2['date'] = pd.to_datetime(df2['date'])
    df3 = pd.read_csv('olddata/spotify_data_1999_1994.csv')
    df3['date'] = pd.to_datetime(df3['date'])
    df4 = pd.read_csv('olddata/combined_data.csv')
    df4['date'] = pd.to_datetime(df4['date'])
    
    print(len(df1), len(df5), len(df2), len(df3), len(df4))    


    # Assuming your dataframes are named df1, df2, df3, and df4
    combined_df = pd.concat([df1, df5, df2, df3, df4])
    combined_df = convert_labels(combined_df)
    combined_df = combined_df.sort_values(by='date')
    drop_dups = combined_df.drop_duplicates()
    
    # Write the combined dataframe to a CSV file
    drop_dups.to_csv('data/combined_data_final.csv', index=False)

#function to convert csv to json
def csv_to_json(csv_file_path, json_file_path):
    
    data = []
    
    with open(csv_file_path, mode='r') as csv_file:
        csv_reader = csv.DictReader(csv_file)
        for row in csv_reader:
            filtered_row = {
                "date": row["date"],    # Replace with actual column names in your CSV
                "rank": row["rank"],    # Replace with actual column names in your CSV
                "label": row["label"]    # Replace with actual column names in your CSV
            }
            data.append(filtered_row)  # Add filtered row to the data list
    
    with open(json_file_path, mode='w') as json_file:
        json.dump(data, json_file, indent=4) 


# Function to convert and map labels
def convert_labels(df):
    label_mapping = {0: 'sad', 1: 'happy', 2: 'energetic', 3: 'calm'}
    # Map numeric labels to text labels
    df['label'] = df['label'].replace(label_mapping)
    return df

# merge_csvs()
# csv_to_json("data/combined_data_final.csv", "data/combined_data_final.json")
print(len(pd.read_csv("data/combined_data_final.csv")))