import Link, { LinkProps } from "next/link";
import { useRouter } from 'next/router';
import { cloneElement, ReactElement } from "react";

interface IActiveLinkProps extends LinkProps {
  children: ReactElement,
  activeClassName: string
}

export function ActiveLink({ activeClassName, children, ...props }: IActiveLinkProps) {
  const { asPath } = useRouter();

  const className = asPath === props.href
    ? activeClassName
    : ''

  return (
    <Link {...props}>
      {cloneElement(children, {
        className
      })}
    </Link>
  )
}