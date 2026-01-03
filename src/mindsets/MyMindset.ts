import { IMindsetLlm, mindset, type IMindset, type IMindsetIdentity } from '@wabot-dev/framework'

@mindset()
export class MyMindset implements IMindset {
  async workflow(): Promise<string> {
     return ` `
  }
  async llms(): Promise<IMindsetLlm[]> {
    return [
      {
        model: 'gpt-4o',
        provider: 'openai',
      },
    ]
  }
  async identity(): Promise<IMindsetIdentity> {
    return {
      name: 'Wabot',
      language: 'Español',
    }
  }

  async skills(): Promise<string> {
    return ''
  }

  async limits(): Promise<string> {
    return ''
  }
}
