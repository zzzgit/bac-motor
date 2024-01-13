import Settler from './Settler'

class FreeSettler extends Settler{
	getPayout(): number{
		return 0
	}
}

export default FreeSettler
