import React, { Component } from 'react'
import GoogleMapReact from 'google-map-react'

const AnyReactComponent = ({ text }) => <div>{text}</div>

const GoogleMap = () => {
  const defaultProps = {
    center: {
      lat: 20.315105,
      lng: 106.2425,
    },
    zoom: 15,
  }

  const handleApiLoaded = (map, maps) => {
    // console.log(maps, 'map')
  }

  return (
    <div style={{ height: '200px', width: '100%' }}>
      <GoogleMapReact
        bootstrapURLKeys={{ key: 'AIzaSyBepqNQwyF7WCttMPtLf6f4EXE9r4Y1zK0' }}
        defaultCenter={defaultProps.center}
        defaultZoom={defaultProps.zoom}
        onGoogleApiLoaded={({ map, maps }) => handleApiLoaded(map, maps)}
      >
        <AnyReactComponent lat={20.315105} lng={106.2425} text="" />
      </GoogleMapReact>
    </div>
  )
}

export default GoogleMap
