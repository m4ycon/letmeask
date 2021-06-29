import { useEffect, useState } from 'react'
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
	const [questionIdToBeDeleted, setQuestionIdToBeDeleted] = useState('')
	const [showModalDelete, setShowModalDelete] = useState(false)

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

	// Controla se o modal de apagar irá aparecer,
	// somente se houver algum id no 'questionToBeDeleted'
	useEffect(
		() => setShowModalDelete(questionIdToBeDeleted ? true : false),
		[questionIdToBeDeleted]
	)

	const handleDeleteQuestion = async () => {
		await database
			.ref(`/rooms/${roomId}/questions/${questionIdToBeDeleted}`)
			.remove()
		setQuestionIdToBeDeleted('')
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
								onClick={() => setQuestionIdToBeDeleted(question.id)}
							>
								<img src={deleteImg} alt='Remover pergunta' />
							</button>
						</Question>
					))}
				</div>
			</main>

			<Modal
				contentLabel='Encerrar sala'
				isOpen={showModalDelete}
				onRequestClose={() => setQuestionIdToBeDeleted('')}
			>
				<svg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
					<path
						d='M3 5.99988H5H21'
						stroke='#E73F5D'
						strokeWidth='2'
						strokeLinecap='round'
						strokeLinejoin='round'
					/>
					<path
						d='M8 5.99988V3.99988C8 3.46944 8.21071 2.96074 8.58579 2.58566C8.96086 2.21059 9.46957 1.99988 10 1.99988H14C14.5304 1.99988 15.0391 2.21059 15.4142 2.58566C15.7893 2.96074 16 3.46944 16 3.99988V5.99988M19 5.99988V19.9999C19 20.5303 18.7893 21.039 18.4142 21.4141C18.0391 21.7892 17.5304 21.9999 17 21.9999H7C6.46957 21.9999 5.96086 21.7892 5.58579 21.4141C5.21071 21.039 5 20.5303 5 19.9999V5.99988H19Z'
						stroke='#E73F5D'
						strokeWidth='2'
						strokeLinecap='round'
						strokeLinejoin='round'
					/>
				</svg>

				<div className='text-container'>
					<h2>Excluir pergunta</h2>
					<p>Tem certeza que você deseja excluir esta pergunta?</p>
				</div>

				<div className='buttons-container'>
					<Button isGray onClick={() => setQuestionIdToBeDeleted('')}>
						Cancelar
					</Button>
					<Button isDanger onClick={handleDeleteQuestion}>
						Sim, excluir
					</Button>
				</div>
			</Modal>

			<Modal
				contentLabel='Encerrar sala'
				isOpen={showModal}
				onRequestClose={() => setShowModal(false)}
			>
				<svg
					xmlns='http://www.w3.org/2000/svg'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth='2'
					strokeLinecap='round'
					strokeLinejoin='round'
				>
					<circle cx='12' cy='12' r='10'></circle>
					<line x1='15' y1='9' x2='9' y2='15'></line>
					<line x1='9' y1='9' x2='15' y2='15'></line>
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
