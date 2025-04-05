import React, { useState } from 'react';
import { StyleSheet, View, PanResponder, GestureResponderEvent } from 'react-native';
import { Image, type ImageSource } from 'expo-image';

type Props = {
  imgSource: ImageSource;
  selectedImage?: string;
  onRectangleDrawn?: (coordinates: RectangleCoordinates) => void;
};

type Coordinate = {
  x: number;
  y: number;
};

export type RectangleCoordinates = {
  topLeft: Coordinate;
  topRight: Coordinate;
  bottomLeft: Coordinate;
  bottomRight: Coordinate;
};

export default function ImageViewer({ imgSource, selectedImage, onRectangleDrawn }: Props) {
  const imageSource = selectedImage ? { uri: selectedImage } : imgSource;
  
  // State to track touch start and current position
  const [startTouch, setStartTouch] = useState<Coordinate | null>(null);
  const [currentTouch, setCurrentTouch] = useState<Coordinate | null>(null);
  
  // State to track if we're currently drawing
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Setup PanResponder for handling touch gestures
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: (event: GestureResponderEvent) => {
      // When touch starts, record the position
      const { locationX, locationY } = event.nativeEvent;
      const newCoordinate = { x: locationX, y: locationY };
      
      setStartTouch(newCoordinate);
      setCurrentTouch(newCoordinate);
      setIsDrawing(true);
    },
    onPanResponderMove: (event: GestureResponderEvent) => {
      // As finger moves, update the current position
      if (isDrawing) {
        const { locationX, locationY } = event.nativeEvent;
        setCurrentTouch({ x: locationX, y: locationY });
      }
    },
    onPanResponderRelease: () => {
      // When finger is lifted, calculate the rectangle coordinates
      if (isDrawing && startTouch && currentTouch) {
        const topLeft = {
          x: Math.min(startTouch.x, currentTouch.x),
          y: Math.min(startTouch.y, currentTouch.y)
        };
        
        const bottomRight = {
          x: Math.max(startTouch.x, currentTouch.x),
          y: Math.max(startTouch.y, currentTouch.y)
        };
        
        const topRight = {
          x: bottomRight.x,
          y: topLeft.y
        };
        
        const bottomLeft = {
          x: topLeft.x,
          y: bottomRight.y
        };
        
        const rectangleCoordinates = {
          topLeft,
          topRight,
          bottomLeft,
          bottomRight
        };
        
        // Log the coordinates
        console.log('Rectangle Coordinates:', rectangleCoordinates);
        
        // Call the callback if provided
        if (onRectangleDrawn) {
          onRectangleDrawn(rectangleCoordinates);
        }
      }
      
      // Reset the drawing state but keep the rectangle visible
      setIsDrawing(false);
    }
  });

  // Calculate rectangle dimensions for rendering
  const getRectangleStyle = () => {
    if (!startTouch || !currentTouch) return null;
    
    const left = Math.min(startTouch.x, currentTouch.x);
    const top = Math.min(startTouch.y, currentTouch.y);
    const width = Math.abs(currentTouch.x - startTouch.x);
    const height = Math.abs(currentTouch.y - startTouch.y);
    
    return {
      position: 'absolute',
      left,
      top,
      width,
      height,
      borderWidth: 2,
      borderColor: 'red',
      backgroundColor: 'rgba(255, 0, 0, 0.1)'
    };
  };
  
  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <Image source={imageSource} style={styles.image} />
      {startTouch && currentTouch && (
        <View style={getRectangleStyle() as any} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    width: 320,
    height: 440,
    borderRadius: 18,
  },
});