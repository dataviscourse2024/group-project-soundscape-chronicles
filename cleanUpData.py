import pandas as pd

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

def merge_csvs():
    #Some code to run later once all 3 of us have gotten our data
    #this chunk will take all of the data we have after collection, and combine it into 1 legible file.
    #make sure to rename the 3 data files.


    # Your mapping dictionary
    label_mapping = {0: 'sad', 1: 'happy', 2: 'energetic', 3: 'calm'}

    # Function to convert and map labels
    def convert_labels(df):
        # Map numeric labels to text labels
        df['label'] = df['label'].replace(label_mapping)
        return df


    df1 = pd.read_csv('data/nicoledata.csv')
    df1['date'] = pd.to_datetime(df1['date'])
    df2 = pd.read_csv('data/Livdata.csv')
    df2['date'] = pd.to_datetime(df2['date'])
    df3 = pd.read_csv('data/karenadata.csv')
    df3['date'] = pd.to_datetime(df3['date'])


    # Assuming your dataframes are named df1, df2, and df3
    combined_df = pd.concat([df1, df2, df3])
    combined_df = convert_labels(combined_df)
    combined_df = combined_df.sort_values(by='date')
    
    # Write the combined dataframe to a CSV file
    combined_df.to_csv('combined_output.csv', index=False)


