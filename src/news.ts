import { gql } from "graphql-request";

import { HkjcClient } from "./_commom/clients";

interface News
{
    
}

const document = gql`
    fragment lotteryDrawsFragment on LotteryDraw {
        id
        year
        no
        openDate
        closeDate
        drawDate
        status
        snowballCode
        snowballName_en
        snowballName_ch
        lotteryPool {
            sell
            status
            totalInvestment
            jackpot
            unitBet
            estimatedPrize
            derivedFirstPrizeDiv
            lotteryPrizes {
            type
            winningUnit
            dividend
            }
        }
        drawResult {
            drawnNo
            xDrawnNo
        }
    }

    query marksixDraw {
        timeOffset {
            m6
            ts
        }
        lotteryDraws {
            ...lotteryDrawsFragment
        }
    }
`;

export async function get()
{
    const res = await HkjcClient.request(document);
    return new Response(res as unknown as string);
}
