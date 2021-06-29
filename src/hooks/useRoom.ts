import { useEffect, useState } from 'react'
import { database } from '../services/firebase'
import { useAuth } from './useAuth'

type FirebaseQuestions = Record<
	string,
	{
		author: {
			name: string
			avatar: string
		}
		content: string
		isAnswered: boolean
		isHighlighted: boolean
		likes: Record<
			string,
			{
				authorId: string
			}
		>
	}
>

export type QuestionType = {
	id: string
	author: {
		name: string
		avatar: string
	}
	content: string
	isAnswered: boolean
	isHighlighted: boolean
	likeCount: number
	likeId: string | undefined
}

export const useRoom = (roomId: string) => {
	const { user } = useAuth()
	const [questions, setQuestions] = useState<QuestionType[]>([])
	const [title, setTitle] = useState('')
	const [authorId, setAuthorId] = useState('')

	useEffect(() => {
		const roomRef = database.ref('/rooms/' + roomId)

		roomRef.on('value', room => {
			const databaseRoom = room.val()
			// const firebaseQuestions = databaseRoom.questions as FirebaseQuestions
			const firebaseQuestions: FirebaseQuestions = databaseRoom.questions ?? {}

			const parsedQuestions = Object.entries(firebaseQuestions).map(
				([key, value]) => ({
					id: key,
					content: value.content,
					author: value.author,
					isHighlighted: value.isHighlighted,
					isAnswered: value.isAnswered,
					likeCount: Object.values(value.likes ?? {}).length,
					likeId: Object.entries(value.likes ?? {}).find(
						([, like]) => like.authorId === user?.id
					)?.[0],
				})
			)

			// Ordena as questões pelos likes,
			// e também se está destacada ou se já foi respondida
			// inicio [...destacadas, ..., ...respondida] fim
			parsedQuestions
				.sort((a, b) => b.likeCount - a.likeCount)
				.sort((a, b) =>
					!a.isAnswered && b.isAnswered
						? -1
						: a.isHighlighted && !b.isHighlighted && !a.isAnswered
						? -1
						: 0
				)

			setTitle(databaseRoom.title)
			setAuthorId(databaseRoom.authorId)
			setQuestions(parsedQuestions)

			return () => roomRef.off('value')
		})
	}, [roomId, user?.id])

	return { authorId, questions, title }
}
