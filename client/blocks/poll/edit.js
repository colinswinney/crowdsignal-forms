/**
 * External dependencies
 */
import React, { useState, useEffect } from 'react';
import { map, some } from 'lodash';

/**
 * WordPress dependencies
 */
import { RichText } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import ClosedBanner from 'components/poll/closed-banner';
import { PollStyles, getPollStyles } from 'components/poll/styles';
import PollResults from 'components/poll/results';
import { maybeAddTemporaryAnswerIds } from 'components/poll/util';
import { withFallbackStyles } from 'components/with-fallback-styles';
import { __ } from 'lib/i18n';
import { ClosedPollState } from './constants';
import EditAnswers from './edit-answers';
import SideBar from './sidebar';
import Toolbar from './toolbar';
import { getStyleVars, getBlockCssClasses, isPollClosed } from './util';
import ErrorBanner from 'components/poll/error-banner';
import { v4 as uuidv4 } from 'uuid';

const withPollAndAnswerIds = ( Element ) => {
	return ( props ) => {
		const { attributes, setAttributes } = props;
		useEffect( () => {
			if ( ! attributes.pollId ) {
				const thePollId = uuidv4();
				setAttributes( { pollId: thePollId } );
			}
			if ( some( attributes.answers, ( a ) => ! a.answerId && a.text ) ) {
				const answers = map( attributes.answers, ( answer ) => {
					if ( answer.answerId || ! answer.text ) {
						return answer;
					}
					const answerId = uuidv4();
					return { ...answer, answerId };
				} );

				setAttributes( { answers } );
			}
		} );

		return <Element { ...props } />;
	};
};

const PollBlock = ( props ) => {
	const {
		attributes,
		className,
		fallbackStyles,
		isSelected,
		setAttributes,
		renderStyleProbe,
	} = props;

	const [ errorMessage, setErrorMessage ] = useState( '' );

	const handleChangeQuestion = ( question ) => setAttributes( { question } );
	const handleChangeNote = ( note ) => setAttributes( { note } );

	const isClosed = isPollClosed(
		attributes.pollStatus,
		attributes.closedAfterDateTime
	);
	const showNote = attributes.note || isSelected;
	const showResults =
		isClosed && ClosedPollState.SHOW_RESULTS === attributes.closedPollState;
	const isHidden =
		isClosed && ClosedPollState.HIDDEN === attributes.closedPollState;
	const hideBranding = true; // hide branding in editor for now

	return (
		<>
			<Toolbar { ...props } />
			<SideBar { ...props } />

			<div
				className={ getBlockCssClasses( attributes, className, {
					'is-selected-in-editor': isSelected,
					'is-closed': isClosed,
					'is-hidden': isHidden,
				} ) }
				style={ getStyleVars( attributes, fallbackStyles ) }
			>
				{ errorMessage && <ErrorBanner>{ errorMessage }</ErrorBanner> }
				<div className="wp-block-crowdsignal-forms-poll__content">
					<RichText
						tagName="h3"
						className="wp-block-crowdsignal-forms-poll__question"
						placeholder={ __( 'Enter your question' ) }
						onChange={ handleChangeQuestion }
						value={ attributes.question }
						allowedFormats={ [] }
					/>

					{ showNote && (
						<RichText
							tagName="p"
							className="wp-block-crowdsignal-forms-poll__note"
							placeholder={ __( 'Add a note (optional)' ) }
							onChange={ handleChangeNote }
							value={ attributes.note }
							allowedFormats={ [] }
						/>
					) }

					{ ! showResults && (
						<EditAnswers
							{ ...props }
							setAttributes={ setAttributes }
						/>
					) }

					{ showResults && (
						<PollResults
							answers={ maybeAddTemporaryAnswerIds(
								attributes.answers
							) }
							hideBranding={ hideBranding }
							setErrorMessage={ setErrorMessage }
						/>
					) }
				</div>

				{ isClosed && (
					<ClosedBanner
						isPollHidden={ isHidden }
						isPollClosed={ isClosed }
					/>
				) }

				{ renderStyleProbe() }
			</div>
		</>
	);
};

export default withFallbackStyles(
	PollStyles,
	getPollStyles
)( withPollAndAnswerIds( PollBlock ) );
