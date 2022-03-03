/**
 * Copyright (c) JOB TODAY S.A. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { ComponentType, useCallback, useEffect, useState } from "react";
import {
  Animated,
  StyleSheet,
  View,
  VirtualizedList,
  ModalProps,
  Modal,
  SafeAreaView
} from "react-native";

import ImageItem from "./components/ImageItem/ImageItem";
import ImageDefaultHeader from "./components/ImageDefaultHeader";
import StatusBarManager from "./components/StatusBarManager";

import useAnimatedComponents from "./hooks/useAnimatedComponents";
import useImageIndexChange from "./hooks/useImageIndexChange";
import useRequestClose from "./hooks/useRequestClose";
import { Dimensions, ImageSource } from "./@types";

type Props = {
  images: ImageSource[];
  keyExtractor?: (imageSrc: ImageSource, index: number) => string;
  imageIndex: number;
  visible: boolean;
  onRequestClose: () => void;
  onLongPress?: (image: ImageSource) => void;
  onImageIndexChange?: (imageIndex: number) => void;
  presentationStyle?: ModalProps["presentationStyle"];
  animationType?: ModalProps["animationType"];
  backgroundColor?: string;
  swipeToCloseEnabled?: boolean;
  doubleTapToZoomEnabled?: boolean;
  delayLongPress?: number;
  HeaderComponent?: ComponentType<{ imageIndex: number }>;
  FooterComponent?: ComponentType<{ imageIndex: number }>;
  headerStyle: any;
  footerStyle: any;
};

const DEFAULT_ANIMATION_TYPE = "fade";
const DEFAULT_BG_COLOR = "#000";
const DEFAULT_DELAY_LONG_PRESS = 800;

function ImageViewing({
  images,
  keyExtractor,
  imageIndex,
  visible,
  onRequestClose,
  onLongPress = () => { },
  onImageIndexChange,
  animationType = DEFAULT_ANIMATION_TYPE,
  backgroundColor = DEFAULT_BG_COLOR,
  presentationStyle,
  swipeToCloseEnabled,
  doubleTapToZoomEnabled,
  delayLongPress = DEFAULT_DELAY_LONG_PRESS,
  HeaderComponent,
  FooterComponent,
  headerStyle,
  footerStyle

}: Props) {
  const imageList = React.createRef<VirtualizedList<ImageSource>>();
  const [opacity, onRequestCloseEnhanced] = useRequestClose(onRequestClose);
  const [layout, setLayout] = React.useState<Dimensions>({ width: 0, height: 0 });
  const [currentImageIndex, onScroll] = useImageIndexChange(imageIndex, layout);
  const [hideStatusBar, setHideStatusBar] = useState(true);
  const [
    headerTransform,
    footerTransform,
    toggleBarsVisible,
  ] = useAnimatedComponents();

  useEffect(() => {
    if (onImageIndexChange) {
      onImageIndexChange(currentImageIndex);
    }
  }, [currentImageIndex]);

  const onZoom = useCallback(
    (isScaled: boolean) => {
      // @ts-ignore
      imageList?.current?.setNativeProps({ scrollEnabled: !isScaled });
      toggleBarsVisible(!isScaled);
    },
    [imageList],
  );

  if (!visible) {
    return null;
  }

  return (
    <Modal
      transparent={presentationStyle === "overFullScreen"}
      visible={visible}
      presentationStyle={presentationStyle}
      animationType={animationType}
      onRequestClose={onRequestCloseEnhanced}
      supportedOrientations={["portrait", "portrait-upside-down", "landscape", "landscape-left", "landscape-right"]}
      hardwareAccelerated
    >
      <StatusBarManager presentationStyle={presentationStyle} />
      <View
        style={[styles.container, { opacity, backgroundColor }]}
        onLayout={(e) => {
          setLayout(e.nativeEvent.layout);
        }}
      >
        <SafeAreaView
          style={[
            styles.header,
            {
              backgroundColor: 'transparent',
            },
            headerStyle
          ]}
        >
          {hideStatusBar ?
            <Animated.View style={[{ transform: headerTransform }]}>
              {typeof HeaderComponent !== "undefined"
                ? (
                  React.createElement(HeaderComponent, {
                    imageIndex: currentImageIndex,
                  })
                )
                : (
                  <ImageDefaultHeader onRequestClose={onRequestCloseEnhanced} />
                )}
            </Animated.View>
            : null}
        </SafeAreaView>
        <VirtualizedList
          ref={imageList}
          data={images}
          horizontal
          pagingEnabled
          windowSize={2}
          initialNumToRender={1}
          maxToRenderPerBatch={1}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          initialScrollIndex={imageIndex}
          getItem={(_, index) => images[index]}
          getItemCount={() => images.length}
          getItemLayout={(_, index) => ({
            length: layout.width,
            offset: layout.width * index,
            index,
          })}
          renderItem={({ item: imageSrc }) => (
            <ImageItem
              onZoom={onZoom}
              imageSrc={imageSrc}
              onRequestClose={onRequestCloseEnhanced}
              onLongPress={onLongPress}
              handleImageClick={() => { setHideStatusBar(!hideStatusBar) }}
              delayLongPress={delayLongPress}
              swipeToCloseEnabled={swipeToCloseEnabled}
              doubleTapToZoomEnabled={doubleTapToZoomEnabled}
              layout={layout ? layout : { width: 0, height: 0 }}
            />
          )}
          onMomentumScrollEnd={onScroll}
          //@ts-ignore
          keyExtractor={(imageSrc, index) => keyExtractor ? keyExtractor(imageSrc, index) : imageSrc.uri || `${imageSrc}`}
        />
        {hideStatusBar ?
          <SafeAreaView
            style={[styles.footer, footerStyle]}>
            {typeof FooterComponent !== "undefined" && (
              <Animated.View
                style={[{ transform: footerTransform }]}
              >
                {React.createElement(FooterComponent, {
                  imageIndex: currentImageIndex,
                })}
              </Animated.View>
            )}
          </SafeAreaView>
          : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 100,
    height: 40,
    width: '100%',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
});

const EnhancedImageViewing = (props: Props) => (
  <ImageViewing key={props.imageIndex} {...props} />
);

export default EnhancedImageViewing;
