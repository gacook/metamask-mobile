import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Image, ViewPropTypes, View } from 'react-native';
import FadeIn from 'react-native-fade-in-image';
// eslint-disable-next-line import/default
import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource';
import { SvgUri } from 'react-native-svg';
import isUrl from 'is-url';
import ComponentErrorBoundary from '../../UI/ComponentErrorBoundary';
import useIpfsGateway from '../../hooks/useIpfsGateway';
import { util } from '@metamask/controllers';

const RemoteImage = (props) => {
	// Avoid using this component with animated SVG
	const source = resolveAssetSource(props.source);
	const isImageUrl = isUrl(props?.source?.uri);
	const ipfsGateway = useIpfsGateway();
	const resolvedIpfsUrl = useMemo(() => {
		try {
			const url = new URL(props.source.uri);
			if (url.protocol !== 'ipfs:') return false;
			const ipfsUrl = util.getFormattedIpfsUrl(ipfsGateway, props.source.uri, false);
			return ipfsUrl;
		} catch {
			return false;
		}
	}, [props.source.uri, ipfsGateway]);

	const uri = resolvedIpfsUrl || source.uri;

	if (source && source.uri && source.uri.match('.svg') && (isImageUrl || resolvedIpfsUrl)) {
		const style = props.style || {};
		if (source.__packager_asset && typeof style !== 'number') {
			if (!style.width) {
				style.width = source.width;
			}
			if (!style.height) {
				style.height = source.height;
			}
		}

		return (
			<ComponentErrorBoundary onError={props.onError} componentLabel="RemoteImage-SVG">
				<View style={style}>
					<SvgUri {...props} uri={uri} width={'100%'} height={'100%'} fill={'black'} />
				</View>
			</ComponentErrorBoundary>
		);
	}

	if (props.fadeIn) {
		return (
			<FadeIn placeholderStyle={props.placeholderStyle}>
				<Image {...props} source={{ uri }} />
			</FadeIn>
		);
	}
	return <Image {...props} source={{ uri }} />;
};

RemoteImage.propTypes = {
	/**
	 * Flag that determines the fade in behavior
	 */
	fadeIn: PropTypes.bool,
	/**
	 * Source of the image
	 */
	source: PropTypes.any,
	/**
	 * Style for the image
	 */
	style: ViewPropTypes.style,
	/**
	 * Style for the placeholder (used for fadeIn)
	 */
	placeholderStyle: ViewPropTypes.style,
	/**
	 * Called when there is an error
	 */
	onError: PropTypes.func,
	/**
	 * This is set if we know that an image is remote
	 */
	isUrl: PropTypes.bool,
};

export default RemoteImage;
