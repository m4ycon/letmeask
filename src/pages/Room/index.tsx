import { FormEvent, useState } from 'react'
import { useParams } from 'react-router-dom'
import cx from 'classnames'

import logoImg from '../../assets/images/logo.svg'

import { Button } from '../../components/Button'
import { RoomCode } from '../../components/RoomCode'

import '../../styles/room.scss'
import { useAuth } from '../../hooks/useAuth'
import { database } from '../../services/firebase'
import { Question } from '../../components/Question'
import { useRoom } from '../../hooks/useRoom'
import LikeButton from '../../components/LikeButton'

type RoomParams = {
	id: string
}

export const Room = () => {
	const { user, signInWithGoogle, signOut } = useAuth()

	const { id: roomId } = useParams<RoomParams>()
	const [newQuestion, setNewQuestion] = useState('')
	const { title, questions } = useRoom(roomId)

	const handleLogin = signInWithGoogle

	const handleSignOut = signOut

	const handleSendQuestion = async (e: FormEvent) => {
		e.preventDefault()

		if (newQuestion.trim() === '') return

		if (!user) throw new Error('You must be logged in')

		const question = {
			content: newQuestion,
			author: {
				name: user.name,
				avatar: user.avatar,
			},
			isHighlighted: false,
			isAnswered: false,
		}

		await database.ref('/rooms/' + roomId + '/questions').push(question)

		setNewQuestion('')
	}

	const handleLikeQuestion = async (
		questionId: string,
		likeId: string | undefined
	) => {
		if (likeId)
			await database
				.ref(`/rooms/${roomId}/questions/${questionId}/likes/${likeId}`)
				.remove()
		else if (user)
			await database
				.ref(`/rooms/${roomId}/questions/${questionId}/likes`)
				.push({
					authorId: user?.id,
				})
	}

	return (
		<div id='page-room'>
			<header>
				<div className='content'>
					<img src={logoImg} alt='Letmeask' />

					<div>
						<RoomCode code={roomId} />
						{user && (
							<Button isOutlined onClick={handleSignOut}>
								Sign Out
							</Button>
						)}
					</div>
				</div>
			</header>

			<main className='content'>
				<div className='room-title'>
					<h1>Sala {title}</h1>
					{questions.length > 0 && <span>{questions.length} perguntas</span>}
				</div>

				<form onSubmit={handleSendQuestion}>
					<textarea
						value={newQuestion}
						onChange={e => setNewQuestion(e.target.value)}
						placeholder='O que você quer perguntar?'
					/>

					<div className='form-footer'>
						{user ? (
							<div className='user-info'>
								<img src={user.avatar} alt={user.name} />
								<span>{user.name}</span>
							</div>
						) : (
							<span>
								Para enviar uma pergunta,{' '}
								<button onClick={handleLogin}>faça seu login</button>.
							</span>
						)}

						<Button type='submit' disabled={!user}>
							Enviar pergunta
						</Button>
					</div>
				</form>

				<div className='question-list'>
					{questions.map(question => (
						<Question
							key={question.id}
							content={question.content}
							author={question.author}
							isHighlighted={question.isHighlighted}
							isAnswered={question.isAnswered}
						>
							{!question.isAnswered && (
								<LikeButton
                  question={question}
									onClick={() =>
										handleLikeQuestion(question.id, question.likeId)
									}
								/>
							)}
						</Question>
					))}
				</div>
			</main>
		</div>
	)
}
