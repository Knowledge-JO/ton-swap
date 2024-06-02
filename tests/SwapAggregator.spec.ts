import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { SwapAggregator } from '../wrappers/SwapAggregator';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('SwapAggregator', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('SwapAggregator');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let swapAggregator: SandboxContract<SwapAggregator>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        swapAggregator = blockchain.openContract(SwapAggregator.createFromConfig({}, code));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await swapAggregator.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: swapAggregator.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and swapAggregator are ready to use
    });
});
