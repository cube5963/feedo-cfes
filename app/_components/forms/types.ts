export interface Section {
    SectionUUID?: string
    FormUUID: string
    SectionName: string
    SectionOrder: number
    SectionType: FormType
    SectionDesc: string
    CreatedAt?: string
    UpdatedAt?: string
    Delete?: boolean
}

export type FormType = "radio" | "checkbox" | "text" | "star" | "two_choice" | "slider"

export interface FormProps {
    initialSections?: Section[]
    formId?: string
    hideFormSelector?: boolean
}

export interface SliderSettings {
    min: number
    max: number
    divisions: number
    labels: { min: string; max: string }
}
