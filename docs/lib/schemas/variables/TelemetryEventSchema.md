[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/schemas](../README.md) / TelemetryEventSchema

# Variable: TelemetryEventSchema

> `const` **TelemetryEventSchema**: `ZodObject`\<\{ `eventType`: `ZodEnum`\<\{ `page_view`: `"page_view"`; `project_click`: `"project_click"`; `route_error`: `"route_error"`; `simulator_milestone_reached`: `"simulator_milestone_reached"`; `simulator_option_select`: `"simulator_option_select"`; `simulator_report_copy`: `"simulator_report_copy"`; `simulator_schedule_click`: `"simulator_schedule_click"`; \}\>; `projectSlug`: `ZodString`; \}, `$strip`\>

Defined in: [lib/schemas.ts:6](https://github.com/fderuiter/portfolio/blob/main/lib/schemas.ts#L6)

Schema for telemetry POST payload validation
