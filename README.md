# SatelliteSR-Frontend

This is a React-based frontend application built to interact with the NASA SpaceApps 2024 challenge project [Satellite Reflectance Data: On the Fly and at Your Fingertips.](https://www.spaceappschallenge.org/nasa-space-apps-2024/challenges/landsat-reflectance-data-on-the-fly-and-at-your-fingertips/?tab=details)

The frontend provides an interactive map for displaying satellite overpass information and Enhanced Vegetation Index (EVI) data in response to user input. It integrates seamlessly with the Flask-based backend to visualize satellite data in real-time.

## Features

- **Interactive Google Map**: Allows users to place markers and interact with the map to specify locations of interest.
- **Satellite Overpass Data Visualization**: Displays upcoming and historical overpasses of Landsat 8 and Landsat 9 satellites.
- **EVI Overlay**: Visualizes the calculated Enhanced Vegetation Index for specific regions.
- **Responsive UI**: Provides user-friendly forms for submitting coordinates, viewing satellite data, and receiving notifications.

## Setup

### Prerequisites

- Node.js and npm (Node Package Manager)

### Installation Steps

1. Clone the repository:

    ```bash
    git clone https://github.com/your-username/SatelliteSR-Frontend.git
    cd SatelliteSR-Frontend
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Create a `.env` file in the project root and add the necessary environment variables:

    ```bash
    REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
    REACT_APP_BACKEND_URL=http://localhost:5001
    ```

4. Run the application:

    ```bash
    npm start
    ```

The application will run locally on [http://localhost:3000](http://localhost:3000) by default.

## Directory Structure

- `public/`: Static files
- `src/`: Source files
    - `components/`: React components
    - `styles/`: CSS or SCSS styles

## Endpoints (Interaction with Backend)

- **`/overpass`**: Fetches upcoming satellite overpass information.
- **`/historical_overpass`**: Retrieves historical satellite overpasses and metadata.
- **`/evi`**: Obtains Enhanced Vegetation Index data for visualization.

## How It Works

1. **Interactive Map**: The application uses Google Maps API to allow users to select a point of interest.
2. **Data Submission**: Users can input coordinates directly or click on the map to drop a pin. The data is sent to the Flask backend to retrieve relevant satellite and EVI information.
3. **EVI Overlay**: The calculated EVI from the backend is overlaid onto the map as a transparent layer to give an intuitive visual representation.

## Capabilities

- **User-Friendly Interface**: Intuitive input methods for submitting latitude and longitude.
- **Satellite Monitoring**: Easy access to view when Landsat satellites will pass over specific areas.
- **Environmental Visualization**: View vegetation health data as an overlay on the Google Map.

## Use Cases

- **Farmers**: Monitor the health of crops by assessing EVI data directly on the map.
- **Urban Planners**: Evaluate the green cover in and around urban areas.
- **Researchers**: Get visual and quantitative data for environmental studies and satellite monitoring.

## Contributing

Contributions are welcome! If you have suggestions or feature requests, please create an issue or open a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## The Team
- Jasper Grant ([@JasperGrant](https://github.com/JasperGrant))
- Aniq Elahi ([@Aniq-byte](https://github.com/Aniq-byte))
- Paras Nath Seth ([@parass05](https://github.com/parass05))
- Christian Simoneau ([@ChrisSimoneau](https://github.com/ChrisSimoneau))
- Aishik Sanyal ([@Xcellect](https://github.com/Xcellect))
