from time import sleep
import requests
import pandas as pd
from datetime import datetime


language = 'en' 
type_of_event = 'selected' 
df = pd.DataFrame(columns=['Date', 'Event Title'])
def hist_api(month, day):

    url = f"https://api.wikimedia.org/feed/v1/wikipedia/{language}/onthisday/{type_of_event}/{month}/{day}"

    response = requests.get(url)

    if response.status_code == 200:
        selected_data = response.json()
        for data in selected_data.get('selected', []):
            year = data.get('year')
            if 2000 <= year <= 2021:
                event = data.get('text')
                date_string = f"{data.get('year')}-{month}-{day}"
                df.loc[len(df)] = [pd.to_datetime(date_string), event]
    else:
        print(f"Error: {response.status_code} - {response.text}")

for i in range(1,13):
    print("starting month", i)
    for j in range(1,31):
        hist_api(str(i), str(j))
        sleep(0.01)
        if j == 15:
            print("halfway done")
    print(f"Month {i} done")

df_sorted = df.sort_values(by='Date')
df_sorted.to_csv('data/historical_events.csv', index=False)