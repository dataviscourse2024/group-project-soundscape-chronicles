import pandas as pd

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