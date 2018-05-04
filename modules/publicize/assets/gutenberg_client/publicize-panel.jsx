/**
 * Publicize sharing panel component.
 *
 * Displays Publicize notifications if no
 * services are connected or displays form if
 * services are connected.
 *
 * {@see publicize.php/save_meta()}
 *
 * @since  5.9.1
 */

/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import {
	getStaticPublicizeConnections,
	requestPublicizeConnections,
} from './async-publicize-lib';
import PublicizeNoConnections from './publicize-no-connections';

import PublicizeForm from './publicize-form';
import PublicizeConnectionVerify from './publicize-connection-verify';
const { __ } = window.wp.i18n;
const { PanelBody } = window.wp.components;

class PublicizePanel extends Component {
	constructor( props ) {
		super( props );
		// Get default connection list generated on original page load so user doesn't have to wait.
		const staticConnectionList = getStaticPublicizeConnections();

		this.state = {
			connections: staticConnectionList,
			isLoading: false,
			didFail: false,
		};
	}

	componentDidMount() {
		this.getConnectionsStart();
	}

	/**
	 * Callback function for when connection request finishes
	 *
	 * Updates component state in response to request finishing.
	 *
	 * @since 5.9.1
	 *
	 * @param {string} resultString JSON encoded result of connection request
	 */
	getConnectionsDone( resultString ) {
		try {
			const result = JSON.parse( resultString );
			this.setState( {
				isLoading: false,
				didFail: false,
				connections: result,
			} );
		} catch ( e ) { // JSON parse fail.
			this.setState( {
				isLoading: false,
				didFail: true,
			} );
		}
	}

	/**
	 * Callback function for when connection request fails
	 *
	 * Updates component state in response to request failing.
	 * Does not clear 'connections' state property so previously
	 * retrieved connection info can still be displayed.
	 *
	 * @since 5.9.1
	 */
	getConnectionsFail() {
		this.setState( {
			isLoading: false,
			didFail: true,
		} );
	}

	/**
	 * Starts request for current list of connections.
	 *
	 * @since 5.9.1
	 */
	getConnectionsStart = () => {
		const postId = $( '#post_ID' ).val();
		this.setState( {
			isLoading: true,
			didFail: false,
		} );

		requestPublicizeConnections( postId ).then(
			( result ) => this.getConnectionsDone( result ),
			( xhr, textStatus, errorThrown ) => this.getConnectionsFail( xhr, textStatus, errorThrown )
		);
	}

	render() {
		const { connections, isLoading } = this.state;
		const refreshText = isLoading ? __( 'Refreshing…' ) : __( 'Refresh connections' );
		return (
			<PanelBody
				initialOpen={ true }
				id="publicize-title"
				title={
					<span id="publicize-defaults" key="publicize-title-span">
						{ __( 'Share this post' ) }
					</span>
				}
			>
				<div>{ __( 'Connect and select social media services to share this post.' ) }</div>
				{ ( connections.length > 0 ) && <PublicizeForm staticConnections={ connections } refreshCallback={ this.getConnectionsStart } /> }
				{ ( 0 === connections.length ) && <PublicizeNoConnections refreshCallback={ this.getConnectionsStart } /> }
				<a tabIndex="0" onClick={ this.getConnectionsStart } disabled={ isLoading }>
					{ refreshText }
				</a>
				{ ( connections.length > 0 ) && <PublicizeConnectionVerify /> }
			</PanelBody>
		);
	}
}

export default PublicizePanel;

