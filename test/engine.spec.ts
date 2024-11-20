import Engine, { BancoMun, Bet } from '../src'

const engine = new Engine()
const config = Object.assign({}, { shouldGenerateRoad: true, shouldCutShoe: true })
engine.powerOn(config)

describe('engine.ts', ()=> {
	test('shutdown.isexhausted', ()=> {
		if (!engine.isWorking){
			engine.powerOn(config)
		}
		engine.playOneHand()
		engine.playOneHand()
		engine.shutdown()
		expect(engine.isShoeExhausted).toBe(false)
	})
	test('shutdown.isWorking', ()=> {
		if (!engine.isWorking){
			engine.powerOn(config)
		}
		engine.shutdown()
		expect(engine.isWorking).toBe(false)
	})
	test('poweron.twice', ()=> {
		const func = (): void=> {
			engine.powerOn(config)
			engine.powerOn(config)
		}
		expect(func).toThrow('the engine has already been powered')
	})
	test('poweron.isWorking', ()=> {
		if (!engine.isWorking){
			engine.powerOn(config)
		}
		expect(engine.isWorking).toBe(true)
	})
	test('playonehand.shutdown', ()=> {
		engine.shutdown()
		const func = (): void=> {
			engine.playOneHand()
		}
		expect(func).toThrow('the engine has been shutdown')
	})
	test('playonehand.getRecycleShoe', ()=> {
		if (!engine.isWorking){
			engine.powerOn(config)
		}
		const houtcome = engine.playOneHand()
		expect(houtcome.bancoHand.getLength()).toBeGreaterThan(1)
	})
	test('playoneshoe.isShoeExhausted', ()=> {
		engine.shutdown()
		if (!engine.isWorking){
			engine.powerOn(config)
		}
		engine.playOneShoe()
		expect(engine.isShoeExhausted).toBe(true)
	})
	test('playoneshoe.shutdown', ()=> {
		engine.shutdown()
		const func = (): void=> {
			engine.playOneShoe()
		}
		expect(func).toThrow('the engine has been shutdown')
	})
	test('playoneshoe.isWorking', ()=> {
		engine.shutdown()
		if (!engine.isWorking){
			engine.powerOn(config)
		}
		engine.playOneShoe()
		engine.playOneShoe()
		engine.playOneShoe()
		expect(engine.isWorking).toBe(true)
	})
	test('playoneshoe.getStatisticInfo', ()=> {
		engine.shutdown()
		if (!engine.isWorking){
			engine.powerOn(config)
		}
		const shoeOutcome = engine.playOneShoe()
		expect(shoeOutcome.getStatisticInfo().total).toBeGreaterThan(50)
	})
	test('playoneshoe.paras', ()=> {
		engine.shutdown()
		if (!engine.isWorking){
			engine.powerOn(config)
		}
		const func = (): Bet=> new Bet(new BancoMun(), 20)
		const shoeOutcome = engine.playOneShoe(func)
		expect(shoeOutcome.getStatisticInfo().total).toBeGreaterThan(50)
	})
})

describe('shoeoutcome.ts', ()=> {
	test('setStatisticInfo', ()=> {
		engine.shutdown()
		if (!engine.isWorking){
			engine.powerOn(config)
		}
		const func = (): Bet=> new Bet(new BancoMun(), 20)
		const shoeOutcome = engine.playOneShoe(func)
		expect(shoeOutcome.getStatisticInfo().pair.total).toBeGreaterThan(2)
	})
})
