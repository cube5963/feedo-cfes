"use client"
import FormManager from './forms/FormManager'
import { FormProps } from './forms/types'

export default function Page(props: FormProps) {
    return <FormManager {...props} />
}
