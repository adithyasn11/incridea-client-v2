import { generateUploadButton } from "@uploadthing/react"
 
export type ClientUploadRouter = {
  accommodationIdProof: {
    input: any
    output: { fileUrl: string }
  }
  pdfUploader: {
      input: any
      output: { fileUrl: string }
  }
}

export const UploadButton = generateUploadButton<any>();
