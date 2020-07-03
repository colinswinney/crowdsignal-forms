/**
 * External dependencies
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { includes, map, without } from 'lodash';

/**
 * Internal dependencies
 */
import PollAnswer from './answer';
import FooterBranding from './footer-branding';

const PollVote = ( {
	answers,
	hasVoted,
	isMultipleChoice,
	isVoting,
	onSubmit,
	submitButtonLabel,
	hideBranding,
} ) => {
	const [ selected, setSelected ] = useState( [] );

	const handleSelect = ( answerId ) => {
		if ( ! isMultipleChoice ) {
			return setSelected( [ answerId ] );
		}

		if ( includes( selected, answerId ) ) {
			return setSelected( without( selected, answerId ) );
		}

		setSelected( [ ...selected, answerId ] );
	};

	const handleSubmit = ( event ) => {
		event.preventDefault();

		onSubmit( selected );
	};

	return (
		<form
			className="wp-block-crowdsignal-forms-poll__form"
			onSubmit={ handleSubmit }
		>
			<div className="wp-block-crowdsignal-forms__options">
				{ map( answers, ( answer, index ) => (
					<PollAnswer
						key={ `poll-answer-${ index }` }
						isMultipleChoice={ isMultipleChoice }
						isSelected={ includes(
							selected,
							answer.answerIdFromApi
						) }
						onSelect={ handleSelect }
						hasVoted={ hasVoted }
						isVoting={ isVoting }
						{ ...answer }
					/>
				) ) }
			</div>

			{ ! hasVoted && (
				<div className="wp-block-crowdsignal-forms-poll__actions">
					<div className="wp-block-button">
						<input
							type="submit"
							className="wp-block-button__link wp-block-crowdsignal-forms-poll__submit-button"
							disabled={ isVoting || ! selected.length }
							value={ submitButtonLabel }
						/>
					</div>
				</div>
			) }
			{ ! hideBranding && (
				<div className="wp_block-crowdsignal-forms-poll__vote-branding">
					<FooterBranding showLogo={ false } />
				</div>
			) }
		</form>
	);
};

PollVote.propTypes = {
	answers: PropTypes.array.isRequired,
	isMultipleChoice: PropTypes.bool,
	onSubmit: PropTypes.func.isRequired,
	submitButtonLabel: PropTypes.string.isRequired,
};

export default PollVote;
