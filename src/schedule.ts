import { IRequest, StatusError } from "itty-router";
import { gql, request } from "graphql-request";

import isValidLanguage from "./_commom/isValidLanguage";

export type Schedule = Month[];

interface Month
{
    month: string;
    events: Event[];
    remarks: Remarks;
}

interface Event
{
    /**
     * The date a draw was scheduled to be held.
     */
    date: string;

    /**
     * Whether the draw was a "Snowball Draws" or not.
     */
    snowball: boolean;
}

interface Remarks
{
    header: string;
    message: string;
}

interface FetchResponse
{
    item:
    {
        years: Array<
        {
            year: `${number}`;
            months: Array<
            {
                key: `${number}`;
                month: { value: `${number}`; };
                dates:
                {
                    date: Array<{ value: `${number}`; }>;
                };
                snowballs:
                {
                    date: Array<{ value: `${number}`; }>;
                };
                presales:
                {
                    date: Array<{ value: `${number}`; }>;
                };
                header: { value: string; };
                message: { value: string; };
            }>;
        }>;
    };
}

const document = gql`
    query MarksixFixtures($lang: String!)
    {
        item(path: "/sitecore/content/Sites/JCBW/NextDrawSchedule/Schedule", language: $lang)
        {
            years: children
            {
                year: name
                months: children
                {
                    key: name
                    month: field(name: "DrawMonth")
                    {
                        value
                    }
                    dates: field(name: "NormalDrawDates")
                    {
                        ... on MultilistField
                        {
                            date: targetItems
                            {
                                value: name
                            }
                        }
                    }
                    snowballs: field(name: "SnowballDrawDates")
                    {
                        ... on MultilistField
                        {
                            date: targetItems
                            {
                                value: name
                            }
                        }
                    }
                    presales: field(name: "PresellDrawDates") 
                    {
                        ... on MultilistField
                        {
                            date: targetItems
                            {
                                value: name
                            }
                        }
                    }
                    header: field(name: "HeaderMessage")
                    {
                        value
                    }
                    message: field(name: "MessageDetail")
                    {
                        value
                    }
                }
            }
        }
    }
`;

export async function get({ query }: IRequest): Promise<Schedule>
{
    const language = query.language ?? "zh-HK";
    if (Array.isArray(language))
    {
        throw new StatusError(400);
    }
    else if (!isValidLanguage(language))
    {
        throw new StatusError(400);
    }

    const response = await request<FetchResponse>(
        "https://consvc.hkjc.com/JCBW/api/graph",
        document,
        { lang: language },
        { "sc_apikey": "{FF2309B7-E8BB-49B2-82A7-36AE0B48F171}" });

    const schedule: Schedule = [];

    for (const year of response.item.years)
    {
        for (const month of year.months)
        {
            const events: Event[] = [];

            for (const date of month.dates.date)
            {
                events.push(
                    {
                        date: `${year.year}-${month.month.value}-${date.value}`,
                        snowball: false,
                    });
            }

            for (const snowball of month.snowballs.date)
            {
                events.push(
                    {
                        date: `${year.year}-${month.month.value}-${snowball.value}`,
                        snowball: true,
                    });
            }

            events.sort((a, b) => (Date.parse(a.date) - Date.parse(b.date)));

            schedule.push(
                {
                    month: `${year.year}-${month.month.value}`,
                    events,
                    remarks: {
                        header: month.header.value,
                        message: month.message.value,
                    },
                });
        }
    }

    return schedule;
}
