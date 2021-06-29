import { ReactNode } from 'react'
import ReactModal from 'react-modal'

import './styles.scss'

ReactModal.setAppElement('#root')
ReactModal.defaultStyles.overlay = {
	...ReactModal.defaultStyles.overlay,
	backgroundColor: 'rgba(0,0,0,.75)',
}

type ModalProps = ReactModal.Props & {
	isOpen: boolean
	onRequestClose: (
		event: React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element>
	) => void
	className?: string
	contentLabel: string
	children: ReactNode
}

const Modal = ({ isOpen, onRequestClose, children, ...props }: ModalProps) => {
	return (
		<ReactModal
			closeTimeoutMS={1000}
			isOpen={isOpen}
			onRequestClose={onRequestClose}
			{...props}
			className={'modal ' + props.className}
		>
			{children}
		</ReactModal>
	)
}

export default Modal
