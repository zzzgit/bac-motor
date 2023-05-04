import {Card} from "cardation"
import PayoutTable from "../settle/PayoutTable"
import GameRule from "./GameRule"

/**
 * Config for BaccaratEngine
 */
// eslint-disable-next-line @typescript-eslint/no-type-alias
type Config = {
	gameRules?: GameRule
	payoutTable?: PayoutTable
	shouldDetectShoe?: boolean
	isTryrun?: boolean
	shouldCutShoe?: boolean
	shouldUseBlackCard?: boolean
	shouldBurnCard?: boolean
	shouldShuffleWhileCollectBancoHand?: boolean
	shouldShuffle?: boolean
	shouldGenerateRoad?: boolean
	shouldGenerateSmallRoad?: boolean
	shouldGenerateOtherRoad?: boolean
	customizedShoe?: Card[]
}

export default Config
