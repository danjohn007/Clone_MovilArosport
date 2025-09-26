import React from 'react';
import { View, StyleSheet } from 'react-native';
import Video from 'react-native-video';

const VideoAd = ({ onEnd }) => {
  return (
    <View style={styles.videoContainer}>
      <Video
        source={{ uri: 'https://www.w3schools.com/html/mov_bbb.mp4' }} // URL de ejemplo
        style={styles.video}
        controls={true} // Agrega controles de reproducción
        resizeMode="contain"
        onEnd={onEnd} // Llama a la función cuando el video termina
        paused={false} // Auto-reproducción activada
      />
    </View>
  );
};

const styles = StyleSheet.create({
  videoContainer: {
    width: '100%',
    height: 250,
    marginTop: 20,
  },
  video: {
    width: '100%',
    height: '100%',
  },
});

export default VideoAd;
