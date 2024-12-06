### Note: Copilot helped with this README

# SoundScape Chronicles

## Overview

SoundScape Chronicles is a project that explores the relationship between historical events and music preferences. By analyzing changes in music preferences—particularly the prevalence of different emotional categories (e.g., sad, happy, calm, energetic)—we aim to gain insights into collective emotional trends during various time periods. This project includes visualizations that provide a historical perspective on how music may reflect or influence public sentiment and emotional trends over time.

## Project Structure

### Code

cleanUpData.py: Contains functions for cleaning and merging CSV data, converting CSV to JSON, and mapping labels.

script.js: Contains the main logic for data visualization using D3.js, including functions for loading data, updating charts, and handling events.

index.html: The main HTML file that structures the webpage and includes the necessary scripts and styles.

### Libraries

D3.js: Used for creating dynamic and interactive data visualizations.

Pandas: Used in cleanUpData.py for data manipulation and analysis.

CSV and JSON: Standard libraries for handling CSV and JSON data in Python.

### URLS

Project Website: [SoundScape Chronicles](https://dataviscourse2024.github.io/group-project-soundscape-chronicles/)

Screencast Video: [Project Milestone Screencast](https://youtu.be/96eMRyBfKro)

### Features

#### Line Chart

Description: Shows the total number of songs for each of the given emotions that appear in the Billboard Top 100 for each year.

Interaction: Click on events to zoom in and see detailed data for a specific time range.

#### Rank Line Chart

Description: Displays the average ranking of songs belonging to each emotion in the Billboard Top 100 by year.

Interaction: Click through different emotions to observe the stability of the average rank.

#### Circle Chart

Description: Represents the log number of songs for each emotion that appear in the Top 100 for a given year.

Interaction: Use the slider to observe changes in trends year by year.

#### Stacked Bar Chart

Description: Shows the proportion of songs for each emotion that appear in the Top 100 for each year.

Interaction: Hover over the bars to see detailed numbers.

#### Event Modals

Description: Clicking on a historical event displays a modal with detailed information about the event.

Interaction: Click the close button or the event circle again to hide the modal.

## Non-Obvious Features

Zooming In on Events: Clicking on a historical event in the line chart zooms in to show data for a specific time range around the event.


Checkable Legends: The legends next to the charts allow users to filter the data by selecting or deselecting emotions.

## How to Run

1. Clone the repository.
2. Open index.html in a web browser to view the visualizations.
3. Run cleanUpData.py to preprocess the data if needed.

OR click on Github Pages Link [SoundScape Chronicles](https://dataviscourse2024.github.io/group-project-soundscape-chronicles/)

## Contributers

Nicole Forrester: Applied Mathematics and Computer Science major.
Karena Klinkenberg: Data Science major.
Liv Bigelow: Data Science major.
