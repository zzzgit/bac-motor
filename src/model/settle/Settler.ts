import Config from "../config/Config"
import HandOutcome from "../result/HandOutcome"


abstract class Settler {
	private _config: Config
	abstract getPayout(wager: number, outcome: HandOutcome):number

	constructor(config:Config) {
		this._config = config
	}

	getConfig():Config {
		return this._config
	}
}

export default Settler
