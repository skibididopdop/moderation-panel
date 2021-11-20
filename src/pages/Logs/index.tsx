import React from "react"
import styled from "styled-components"
import { getLogs, LogResolved, GetLogsOptions, LogsPage, SortDirection, LogType } from "@free-draw/moderation-client"
import API from "../../API"
import TextButton from "../../components/TextButton"
import Spinner from "../../components/Spinner"
import Options from "./Options"
import LogComponent from "./Log"
import ButtonStyle from "../../enum/ButtonStyle"
import SortMethod from "../../enum/SortMethod"

const sortMethodOptions = {
	[SortMethod.TIME_ASCENDING]: { direction: SortDirection.DESCENDING },
	[SortMethod.TIME_DESCENDING]: { direction: SortDirection.ASCENDING },
} as Record<SortMethod, GetLogsOptions>

const LogsPageElement = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: center;
	padding-top: 50px;
`

const OptionsContainerElement = styled.div``

const ContentContainerElement = styled.div`
	width: 750px;
	position: relative;
	display: flex;
	flex-direction: column;
`

const ContentFooterElement = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	height: 100px;
`

function LogsPageComponent() {
	const [ loaded, setLoaded ] = React.useState(false)

	const [ content, setContent ] = React.useState<LogResolved[][]>([])
	const [ page, setPage ] = React.useState<LogsPage | null>(null)

	const [ sort, setSort ] = React.useState<SortMethod>(SortMethod.TIME_DESCENDING)
	const [ filter, setFilter ] = React.useState<LogType | null>(null)

	React.useEffect(() => {
		(async () => {
			setLoaded(false)

			const options = {
				...sortMethodOptions[sort],
				size: 30,
			} as Partial<GetLogsOptions>
			if (filter) {
				options.type = filter
			}

			const initialPage = await getLogs(API, options)
			const initialPageResolved = await initialPage.resolveAll(API)

			setContent([ initialPageResolved ])
			setPage(initialPage)
			setLoaded(true)
		})()
	}, [ sort, filter ])

	return (
		<LogsPageElement>
			<OptionsContainerElement>
				<Options
					sort={sort}
					setSort={setSort}
					filter={filter}
					setFilter={setFilter}
				/>
			</OptionsContainerElement>
			<ContentContainerElement>
				{
					content.flatMap((pageResolved) => {
						return pageResolved.map((logResolved, index) => {
							return (
								<LogComponent
									key={index}
									log={logResolved.log}
									data={logResolved.data}
									moderator={logResolved.moderator}
								/>
							)
						})
					})
				}
				<ContentFooterElement>
					{
						loaded ? (
							<TextButton
								text="View More"
								style={ButtonStyle.FILLED}
								onClick={async () => {
									setLoaded(false)

									const newPage = await page!.next(API)
									if (newPage.logs.length > 0) {
										const newPageResolved = await newPage.resolveAll(API)

										setPage(newPage)
										setContent([ ...content, newPageResolved ])
									}

									setLoaded(true)
								}}
							/>
						) : <Spinner />
					}
				</ContentFooterElement>
			</ContentContainerElement>
		</LogsPageElement>
	)
}

export default LogsPageComponent

export {
	LogsPageElement,
}