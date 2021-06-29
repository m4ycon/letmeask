import { useEffect } from 'react'
import { useHistory, useParams } from 'react-router-dom'

import logoImg from '../../assets/images/logo.svg'
import deleteImg from '../../assets/images/delete.svg'
import checkImg from '../../assets/images/check.svg'
import answerImg from '../../assets/images/answer.svg'

import { Button } from '../../components/Button'
import { RoomCode } from '../../components/RoomCode'

import '../../styles/room.scss'
import { database } from '../../services/firebase'
import { Question } from '../../components/Question'
import { useRoom } from '../../hooks/useRoom'
import { useAuth } from '../../hooks/useAuth'
import LikeButton from '../../components/LikeButton'

type RoomParams = {
	id: string
}

export const AdminRoom = () => {
	const history = useHistory()

	const { user, signOut } = useAuth()
	const { id: roomId } = useParams<RoomParams>()
	const { authorId, title, questions } = useRoom(roomId)

	useEffect(() => {
		if (
			!authorId ||
			(localStorage.getItem('is_signed') && user?.id === authorId)
		)
			return

		alert('Unauthorized')
		return history.push(`/rooms/${roomId}`)
	}, [authorId, user?.id])

	const handleSignOut = async () => {
		await signOut()
		history.push(`/rooms/${roomId}`)
	}

	const handleEndRoom = async () => {
		await database.ref(`/rooms/${roomId}`).update({
			endedAt: new Date(),
		})

		history.push('/')
	}

	const handleCheckQuestionAsAnswered = async (questionId: string) => {
		await database.ref(`/rooms/${roomId}/questions/${questionId}`).update({
			isAnswered: true,
		})
	}

	const handleHighlightQuestion = async (questionId: string) => {
		await database.ref(`/rooms/${roomId}/questions/${questionId}`).update({
			isHighlighted: true,
		})
	}

	const handleDeleteQuestion = async (questionId: string) => {
		if (window.confirm('Tem certeza que deseja excluir esta pergunta?')) {
			await database.ref(`/rooms/${roomId}/questions/${questionId}`).remove()
		}
	}

	return (
		<div id='page-room'>
			<header>
				<div className='content'>
					<img src={logoImg} alt='Letmeask' />

					<div>
						<RoomCode code={roomId} />
						<Button isOutlined onClick={handleEndRoom}>
							Encerrar sala
						</Button>
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
								<>
                  <LikeButton question={question} disabled />
									<button
										type='button'
										onClick={() => handleCheckQuestionAsAnswered(question.id)}
									>
										<img src={checkImg} alt='Marcar pergunta como respondida' />
									</button>
									<button
										type='button'
										onClick={() => handleHighlightQuestion(question.id)}
									>
										<img src={answerImg} alt='Dar destaque à pergunta' />
									</button>
								</>
							)}
							<button
								type='button'
								onClick={() => handleDeleteQuestion(question.id)}
							>
								<img src={deleteImg} alt='Remover pergunta' />
							</button>
						</Question>
					))}
				</div>
			</main>
		</div>
	)
}
