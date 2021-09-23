import React from "react"
import styled from "styled-components"
import { useHistory } from "react-router-dom"
import { mdiMagnify, mdiTrashCanOutline, mdiPlus } from "@mdi/js"
import useAsync from "/src/util/useAsync"
import Maid from "/src/class/Maid"

import { getModerator } from "/src/api/moderators"

import colors from "/src/presets/colors"

import IconButton from "/src/components/IconButton"
import Dialog from "/src/components/Dialog"
import { Field, FieldGroup } from "/src/components/fields"

import ContentSection from "./ContentSection"

function DeleteDialog(props) {
	return (
		<Dialog
			title="Delete action?"
			description={`You're about to delete this ${props.action.type}. This is permanent.`}
			buttons={[
				{
					id: "cancel",
					text: "Cancel",
					onClick: props.onClose,
				},
				{
					id: "confirm",
					text: "Delete",
					style: "filled",
					onClick: props.onDelete,
				},
			]}
			onCancel={props.onClose}
		/>
	)
}

const ActionElement = styled.div`
	border: 1px solid ${props => props.expanded ? colors.brand[600] : colors.border};
	border-radius: 8px;
	padding: 16px;
	display: flex;
	flex-direction: column;
	user-select: none;
	cursor: pointer;
	opacity: ${props => props.enabled || props.expanded ? "100%" : "50%"};

	${props => props.enabled ? "" : "filter: grayscale(100%)"};

	& + & {
		margin-top: 8px;
	}
`

const ActionDetailsElement = styled.div`
	position: relative;
`

const ActionTextElement = styled.div`
	display: flex;
	flex-direction: column;
`

const ActionReasonElement = styled.span`
	font-size: 18px;
	font-weight: 600;
	color: ${colors.brand[600]};
`

const ActionTypeElement = styled.span`
	font-size: 14px;
	font-weight: 400;
	letter-spacing: 1px;
	text-transform: uppercase;
	margin-top: 6px;
`

const ActionExtendedDetailsElement = styled.div`
	display: ${props => props.expanded ? "flex" : "none"};
	margin-top: 16px;
`

const ActionButtonsElement = styled.div`
	position: absolute;
	top: 0;
	right: 0;
	height: 100%;
	display: flex;
	flex-direction: row;
	align-items: center;
	visibility: hidden;

	> * + * {
		margin-left: 6px;
	}

	${ActionElement}:hover & {
		visibility: visible;
	}
`

function Action({ action }) {
	const history = useHistory()

	const [ expanded, setExpanded ] = React.useState(false)
	const [ prompt, setPrompt ] = React.useState(false)

	const moderator = useAsync(getModerator, !action.moderator || !expanded)(action.moderator)
	const moderatorName = action.moderator ? (moderator ? moderator.name : "Loading...") : "Unknown"
	const moderatorNameLoaded = action.moderator && moderator

	return (
		<ActionElement
			enabled={action.active}
			expanded={expanded}
			onClick={() => setExpanded(!expanded)}
		>
			<ActionDetailsElement>
				<ActionTextElement>
					<ActionReasonElement>{action.reason}</ActionReasonElement>
					<ActionTypeElement>{action.type}</ActionTypeElement>
				</ActionTextElement>
				<ActionButtonsElement>
					{
						action.report ? (
							<IconButton
								icon={mdiMagnify}
								onClick={() => history.push(`/reports/${action.report}`)}
							/>
						) : null
					}
					<>
						{
							action.active ? (
								<IconButton
									icon={mdiTrashCanOutline}
									onClick={() => setPrompt(true)}
								/>
							) : null
						}
						{
							prompt ? (
								<DeleteDialog
									action={action}
									onDelete={async () => {
										setPrompt(false)
										await action.delete()
									}}
									onClose={() => setPrompt(false)}
								/>
							) : null
						}
					</>
				</ActionButtonsElement>
			</ActionDetailsElement>
			<ActionExtendedDetailsElement expanded={expanded}>
				<FieldGroup>
					<Field
						name="Notes"
						value={action.notes ?? "No notes specified"}
						empty={!action.notes}
					/>
					<Field
						name="Moderator"
						value={moderatorName}
						empty={!moderatorNameLoaded}
						inline
					/>
					<Field
						name="Time"
						value={action.timestamp.toLocaleString()}
						inline
					/>
					{
						action.expiry ? (
							<Field
								name="Expiry"
								value={action.expiry.toLocaleString()}
								inline
							/>
						) : null
					}
				</FieldGroup>
			</ActionExtendedDetailsElement>
		</ActionElement>
	)
}

function Actions({ user }) {
	const [ actions, setActions ] = React.useState(null)

	React.useEffect(() => {
		setActions(null)

		if (user) {
			function update() {
				setActions([].concat(user.actions, user.history))
			}

			const maid = new Maid()
			maid.listen(user, "actionCreate", update)
			maid.listen(user, "actionDelete", update)

			update()

			return () => maid.clean()
		}
	}, [ user ])

	let status
	if (actions && actions.length > 0) {
		status = "LOADED"
	} else if (actions) {
		status = "EMPTY"
	} else {
		status = "LOADING"
	}

	return (
		<ContentSection
			name="Actions"
			loading={!actions}
			status={status}
			buttons={[
				{
					id: "create",
					icon: mdiPlus,
					onClick() {

					},
				},
			]}
		>
			{
				actions && actions.length > 0 ? (
					[ ...actions ]
						.sort((B, A) => A.timestamp.getTime() - B.timestamp.getTime())
						.map(action => <Action key={action.id} action={action} />)
				) : null
			}
		</ContentSection>
	)
}

export default Actions

export {
	ActionElement,

	ActionDetailsElement,
	ActionTextElement,
	ActionReasonElement,
	ActionTypeElement,

	ActionExtendedDetailsElement,
	ActionButtonsElement,
}