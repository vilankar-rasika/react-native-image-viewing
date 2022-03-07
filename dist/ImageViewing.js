/**
 * Copyright (c) JOB TODAY S.A. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import React, { useCallback, useEffect, useState } from "react";
import { Animated, StyleSheet, View, VirtualizedList, Modal, SafeAreaView, StatusBar } from "react-native";
import ImageItem from "./components/ImageItem/ImageItem";
import ImageDefaultHeader from "./components/ImageDefaultHeader";
import useAnimatedComponents from "./hooks/useAnimatedComponents";
import useImageIndexChange from "./hooks/useImageIndexChange";
import useRequestClose from "./hooks/useRequestClose";
const DEFAULT_ANIMATION_TYPE = "fade";
const DEFAULT_BG_COLOR = "#000";
const DEFAULT_DELAY_LONG_PRESS = 800;
function ImageViewing({ images, keyExtractor, imageIndex, visible, onRequestClose, onLongPress = () => { }, onImageIndexChange, animationType = DEFAULT_ANIMATION_TYPE, backgroundColor = DEFAULT_BG_COLOR, presentationStyle, swipeToCloseEnabled, doubleTapToZoomEnabled, delayLongPress = DEFAULT_DELAY_LONG_PRESS, HeaderComponent, FooterComponent, headerStyle, footerStyle }) {
    const imageList = React.createRef();
    const [opacity, onRequestCloseEnhanced] = useRequestClose(onRequestClose);
    const [layout, setLayout] = React.useState({ width: 0, height: 0 });
    const [currentImageIndex, onScroll] = useImageIndexChange(imageIndex, layout);
    const [hideStatusBar, setHideStatusBar] = useState(true);
    const [headerTransform, footerTransform, toggleBarsVisible,] = useAnimatedComponents();
    useEffect(() => {
        if (onImageIndexChange) {
            onImageIndexChange(currentImageIndex);
        }
    }, [currentImageIndex]);
    const onZoom = useCallback((isScaled) => {
        var _a, _b;
        // @ts-ignore
        (_b = (_a = imageList) === null || _a === void 0 ? void 0 : _a.current) === null || _b === void 0 ? void 0 : _b.setNativeProps({ scrollEnabled: !isScaled });
        toggleBarsVisible(!isScaled);
        setHideStatusBar(false);
    }, [imageList]);
    if (!visible) {
        return null;
    }
    const handleImageClick = () => {
        setHideStatusBar(!hideStatusBar);
    };
    return (<Modal transparent={presentationStyle === "overFullScreen"} visible={visible} presentationStyle={presentationStyle} animationType={animationType} onRequestClose={onRequestCloseEnhanced} supportedOrientations={["portrait", "portrait-upside-down", "landscape", "landscape-left", "landscape-right"]} hardwareAccelerated>
      
      <StatusBar translucent backgroundColor="transparent" hidden/>
      <View style={[styles.container, { opacity, backgroundColor }]} onLayout={(e) => {
        setLayout(e.nativeEvent.layout);
    }} onStartShouldSetResponder={() => { handleImageClick(); return true; }}>
        {hideStatusBar && typeof HeaderComponent !== "undefined" ?
        <SafeAreaView style={[
            styles.header,
            { backgroundColor: 'transparent' },
            headerStyle
        ]}>
            <Animated.View style={[{ transform: headerTransform }]}>
              {typeof HeaderComponent !== "undefined"
            ? (React.createElement(HeaderComponent, {
                imageIndex: currentImageIndex,
            }))
            : (<ImageDefaultHeader onRequestClose={onRequestCloseEnhanced}/>)}
            </Animated.View>
          </SafeAreaView>
        : null}
        <VirtualizedList ref={imageList} data={images} horizontal pagingEnabled windowSize={2} initialNumToRender={1} maxToRenderPerBatch={1} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} initialScrollIndex={imageIndex} getItem={(_, index) => images[index]} getItemCount={() => images.length} getItemLayout={(_, index) => ({
        length: layout.width,
        offset: layout.width * index,
        index,
    })} renderItem={({ item: imageSrc }) => (<ImageItem onZoom={onZoom} imageSrc={imageSrc} onRequestClose={onRequestCloseEnhanced} onLongPress={onLongPress} handleImageClick={handleImageClick} delayLongPress={delayLongPress} swipeToCloseEnabled={swipeToCloseEnabled} doubleTapToZoomEnabled={doubleTapToZoomEnabled} layout={layout ? layout : { width: 0, height: 0 }}/>)} onMomentumScrollEnd={onScroll} 
    //@ts-ignore
    keyExtractor={(imageSrc, index) => keyExtractor ? keyExtractor(imageSrc, index) : imageSrc.uri || `${imageSrc}`}/>
        {hideStatusBar && typeof FooterComponent !== "undefined" ?
        <SafeAreaView style={[styles.footer, footerStyle]}>
            {typeof FooterComponent !== "undefined" && (<Animated.View style={[{ transform: footerTransform }]}>
                {React.createElement(FooterComponent, {
            imageIndex: currentImageIndex,
        })}
              </Animated.View>)}
          </SafeAreaView>
        : null}
      </View>
    </Modal>);
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
const EnhancedImageViewing = (props) => (<ImageViewing key={props.imageIndex} {...props}/>);
export default EnhancedImageViewing;
