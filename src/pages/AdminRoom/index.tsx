import { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'

import logoImg from '../../assets/images/logo.svg'
import deleteImg from '../../assets/images/delete.svg'
import checkImg from '../../assets/images/check.svg'
import answerImg from '../../assets/images/answer.svg'
import closeImg from '../../assets/images/close.svg'

import { Button } from '../../components/Button'
import { RoomCode } from '../../components/RoomCode'

import '../../styles/room.scss'
import { database } from '../../services/firebase'
import { Question } from '../../components/Question'
import { useRoom } from '../../hooks/useRoom'
import { useAuth } from '../../hooks/useAuth'
import LikeButton from '../../components/LikeButton'
import Modal from '../../components/Modal'

type RoomParams = {
	id: string
}

export const AdminRoom = () => {
	const history = useHistory()

	const { user, signOut } = useAuth()
	const { id: roomId } = useParams<RoomParams>()
	const { authorId, title, questions } = useRoom(roomId)
	const [showModal, setShowModal] = useState(false)

	useEffect(() => {
		if (
			!authorId ||
			(localStorage.getItem('is_signed') && user?.id === authorId)
		)
			return

		alert('Unauthorized')
		return history.push(`/rooms/${roomId}`)
	}, [authorId, user?.id, roomId, history])

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
						<Button isOutlined onClick={() => setShowModal(true)}>
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

			<Modal
				contentLabel='Encerrar sala'
				isOpen={showModal}
				onRequestClose={() => setShowModal(false)}
				preventScroll
			>
				<svg
					xmlns='http://www.w3.org/2000/svg'
					width='40'
					height='40'
					viewBox='0 0 40 40'
					fill='none'
					stroke='currentColor'
					strokeWidth='3'
					strokeLinecap='round'
					strokeLinejoin='round'
				>
					<circle cx='20' cy='20' r='16'></circle>
					<line x1='25' y1='15' x2='15' y2='25'></line>
					<line x1='15' y1='15' x2='25' y2='25'></line>
				</svg>

				<div className='text-container'>
					<h2>Encerrar sala</h2>
					<p>Tem certeza que você deseja encerrar esta sala?</p>
				</div>

				<div className='buttons-container'>
					<Button isGray onClick={() => setShowModal(false)}>
						Cancelar
					</Button>
					<Button isDanger onClick={handleEndRoom}>
						Sim, encerrar
					</Button>
				</div>
			</Modal>
		</div>
	)
}
