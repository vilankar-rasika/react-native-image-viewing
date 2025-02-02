/**
 * Copyright (c) JOB TODAY S.A. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useState, useCallback } from "react";

import {
  Animated,
  StyleSheet,
  NativeScrollEvent,
  NativeSyntheticEvent,
  TouchableWithoutFeedback
} from "react-native";

import useImageDimensions from "../../hooks/useImageDimensions";
import usePanResponder from "../../hooks/usePanResponder";

import { getImageStyles, getImageTransform } from "../../utils";
import { ImageSource, Dimensions } from "../../@types";
import ImageLoading from "./ImageLoading";

const SWIPE_CLOSE_OFFSET = 75;
const SWIPE_CLOSE_VELOCITY = 1.75;

type Props = {
  imageSrc: ImageSource;
  onRequestClose: () => void;
  onZoom: (isZoomed: boolean) => void;
  onLongPress: (image: ImageSource) => void;
  delayLongPress: number;
  swipeToCloseEnabled?: boolean;
  doubleTapToZoomEnabled?: boolean;
  layout: Dimensions;
  handleImageClick: () => void;
};

const ImageItem = ({
  imageSrc,
  onZoom,
  onRequestClose,
  onLongPress,
  delayLongPress,
  swipeToCloseEnabled = true,
  doubleTapToZoomEnabled = true,
  layout,
  handleImageClick
}: Props) => {
  const imageContainer = React.createRef<any>();
  const imageDimensions = useImageDimensions(imageSrc);
  const [translate, scale] = getImageTransform(imageDimensions, layout);
  const scrollValueY = new Animated.Value(0);
  const [isLoaded, setLoadEnd] = useState(false);

  const onLoaded = useCallback(() => setLoadEnd(true), []);
  const onZoomPerformed = (isZoomed: boolean) => {
    onZoom(isZoomed);
    if (imageContainer?.current) {
      // @ts-ignore
      imageContainer.current.setNativeProps({
        scrollEnabled: !isZoomed,
      });
    }
  };

  const onLongPressHandler = useCallback(() => {
    onLongPress(imageSrc);
  }, [imageSrc, onLongPress]);

  const [panHandlers, scaleValue, translateValue] = usePanResponder({
    initialScale: scale || 1,
    initialTranslate: translate || { x: 0, y: 0 },
    onZoom: onZoomPerformed,
    doubleTapToZoomEnabled,
    onLongPress: onLongPressHandler,
    delayLongPress,
    layout
  });

  const layoutStyle = React.useMemo(() => ({
    width: layout.width,
    height: layout.height,
  }), [layout]);

  const imagesStyles = getImageStyles(
    imageDimensions,
    translateValue,
    scaleValue
  );
  const imageOpacity = scrollValueY.interpolate({
    inputRange: [-SWIPE_CLOSE_OFFSET, 0, SWIPE_CLOSE_OFFSET],
    outputRange: [0.7, 1, 0.7],
  });
  const imageStylesWithOpacity = { ...imagesStyles, opacity: imageOpacity };

  const onScrollEndDrag = ({
    nativeEvent,
  }: NativeSyntheticEvent<NativeScrollEvent>) => {
    const velocityY = nativeEvent?.velocity?.y ?? 0;
    const offsetY = nativeEvent?.contentOffset?.y ?? 0;

    if (
      (Math.abs(velocityY) > SWIPE_CLOSE_VELOCITY &&
        offsetY > SWIPE_CLOSE_OFFSET) ||
      offsetY > layout.height / 2
    ) {
      onRequestClose();
    }
  };

  const onScroll = ({
    nativeEvent,
  }: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = nativeEvent?.contentOffset?.y ?? 0;

    scrollValueY.setValue(offsetY);
  };

  return (
    <Animated.ScrollView
      ref={imageContainer}
      style={layoutStyle}
      pagingEnabled
      nestedScrollEnabled
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        height: layout.height * 2
      }}
      scrollEnabled={swipeToCloseEnabled}
      {...(swipeToCloseEnabled && {
        onScroll,
        onScrollEndDrag,
      })}
    >
      <TouchableWithoutFeedback onPress={handleImageClick}>
        <Animated.Image
          {...panHandlers}
          source={imageSrc}
          style={imageStylesWithOpacity}
          onLoad={onLoaded}
        />
      </TouchableWithoutFeedback>
      {(!isLoaded || !imageDimensions) && <ImageLoading style={layoutStyle} />}
    </Animated.ScrollView>
  );
};

export default React.memo(ImageItem);
