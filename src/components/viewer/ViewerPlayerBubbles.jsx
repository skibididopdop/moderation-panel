import React from "react"
import styled from "styled-components"

import { getRobloxThumbnail } from "/src/api/roblox"

import useAsync from "/src/util/useAsync"

import ViewerPositionalOverlay from "./ViewerPositionalOverlay"

const size = 64

const ViewerPlayerBubbleElement = styled.a.attrs({
	target: "_blank",
})`
	width: 64px;
	display: flex;
	flex-direction: column;
	align-items: center;
	transform: translate(-${size / 2}px, -${size / 2}px);
	user-select: none;
	pointer-events: none;
`

const ViewerPlayerBubbleAvatarElement = styled.img`
	width: ${size};
	height: ${size};
	border-radius: 50%;
	background: white;
	box-shadow: 0 10px 20px rgba(0, 0, 0, 18%);
	pointer-events: all;
`

const ViewerPlayerBubbleNameElement = styled.span`
	color: black;
	font-size: 16px;
	font-weight: 700;
	margin-top: 12px;
`

function ViewerPlayerBubble(props) {
	const { player, position } = props
	const avatar = useAsync(getRobloxThumbnail)("AvatarHeadShot", player.id, "100x100")

	return (
		<ViewerPositionalOverlay position={position} ignoreScale>
			<ViewerPlayerBubbleElement href={`https://www.roblox.com/users/${player.id}/profile`}>
				<ViewerPlayerBubbleAvatarElement src={avatar} />
				<ViewerPlayerBubbleNameElement>{player.name}</ViewerPlayerBubbleNameElement>
			</ViewerPlayerBubbleElement>
		</ViewerPositionalOverlay>
	)
}

const ViewerPlayerBubblesElement = styled.div``

function ViewerPlayerBubbles(props) {
	return (
		<ViewerPlayerBubblesElement>
			{
				Object.values(props.players).map((player) => {
					return (
						<ViewerPlayerBubble
							key={player.id}
							player={player}
							position={player.position}
						/>
					)
				})
			}
		</ViewerPlayerBubblesElement>
	)
}

export default ViewerPlayerBubbles

export {
	ViewerPlayerBubbleElement,
	ViewerPlayerBubbleAvatarElement,
	ViewerPlayerBubbleNameElement,

	ViewerPlayerBubblesElement,
}