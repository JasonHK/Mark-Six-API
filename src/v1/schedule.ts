import { IRequest, json } from "itty-router";
import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { gql, request } from "graphql-request";

import { Language } from "../_commom/Language";

const EventType = z.enum(["draws", "presale"]);
type EventType = z.infer<typeof EventType>;

type Event = z.infer<typeof Event>;
const Event = z.discriminatedUnion("type", [
    z.object({
        date: z.string().date(),
        type: z.literal(EventType.Enum.draws),
        snowball: z.boolean(),
    }),
    z.object({
        date: z.string().date(),
        type: z.literal(EventType.Enum.presale),
    }),
]);

type Remarks = z.infer<typeof Remarks>;
const Remarks = z.object({
    header: z.string(),
    message: z.string(),
});

type Month = z.infer<typeof Month>;
const Month = z.object({
    month: z.string(),
    events: Event.array(),
    remarks: Remarks.nullable(),
});

const Schedule = Month.array();
type Schedule = z.infer<typeof Schedule>;

type ScheduleResponse = z.infer<typeof ScheduleResponse>;
const ScheduleResponse = z.object({
    item: z.object({
        years: z.array(z.object({
            year: z.string().regex(/^\d{4}$/),
            months: z.array(z.object({
                key: z.string().regex(/^\d{1,2}$/),
                month: z.object({ value: z.string().regex(/^\d{2}$/) }),
                dates: z.object({
                    date: z.array(z.object({ value: z.string().regex(/^\d{2}$/) })),
                }),
                snowballs: z.object({
                    date: z.array(z.object({ value: z.string().regex(/^\d{2}$/) })),
                }),
                presales: z.object({
                    date: z.array(z.object({ value: z.string().regex(/^\d{2}$/) })),
                }),
                header: z.object({ value: z.string() }),
                message: z.object({ value: z.string() }),
            })),
        })),
    }),
});

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

export class GetSchedule extends OpenAPIRoute
{
    static headers = Object.freeze({
        "Cache-Control": "public, max-age=3600",
    });

    schema = {
        request: {
            query: z.object({
                language: Language.optional().default("zh-HK"),
            }),
        },
        responses: {
            "200": {
                description: "",
                content: {
                    "application/json": {
                        schema: Schedule,
                    },
                },
            },
        },
    };

    async handle(_ :IRequest, env: Env): Promise<Response>
    {
        const { query } = await this.getValidatedData<typeof this.schema>();
        
        const response = await request<ScheduleResponse>(
                "https://consvc.hkjc.com/JCBW/api/graph",
                document,
                { lang: query.language },
                { sc_apikey: env.SC_API_KEY })
            .then(ScheduleResponse.parseAsync);

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
                            type: EventType.Enum.draws,
                            snowball: false,
                        });
                }

                for (const snowball of month.snowballs.date)
                {
                    events.push(
                        {
                            date: `${year.year}-${month.month.value}-${snowball.value}`,
                            type: EventType.Enum.draws,
                            snowball: true,
                        });
                }

                for (const presale of month.presales.date)
                {
                    events.push(
                        {
                            date: `${year.year}-${month.month.value}-${presale.value}`,
                            type: EventType.Enum.presale,
                        });
                }

                events.sort((a, b) => (Date.parse(a.date) - Date.parse(b.date)));

                let remarks = null;
                if (month.header.value || month.message.value)
                {
                    remarks = {
                        header: month.header.value,
                        message: month.message.value,
                    };
                }
    
                schedule.push(
                    {
                        month: `${year.year}-${month.month.value}`,
                        events,
                        remarks,
                    });
            }
        }

        return json(schedule, { headers: GetSchedule.headers });
    }
}
