import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type SwapAggregatorConfig = {};

export function swapAggregatorConfigToCell(config: SwapAggregatorConfig): Cell {
    return beginCell().endCell();
}

export class SwapAggregator implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new SwapAggregator(address);
    }

    static createFromConfig(config: SwapAggregatorConfig, code: Cell, workchain = 0) {
        const data = swapAggregatorConfigToCell(config);
        const init = { code, data };
        return new SwapAggregator(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }
}
