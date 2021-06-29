import { ButtonHTMLAttributes } from 'react'
import cx from 'classnames'

import './styles.scss'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	isOutlined?: boolean
	isDanger?: boolean
	isGray?: boolean
}

export const Button = ({
	isOutlined,
	isDanger,
	isGray,
	...props
}: ButtonProps) => {
	return (
		<button
			className={cx('button', {
				outlined: isOutlined,
				danger: isDanger,
				gray: isGray,
			})}
			{...props}
		/>
	)
}
