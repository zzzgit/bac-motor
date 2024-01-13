import { CustomError } from 'ts-custom-error'

class EngineError extends CustomError{
	constructor(message?: string){
		super(message)
		this.message = '[baccarat-engine]' + message
	}
}
export default EngineError
