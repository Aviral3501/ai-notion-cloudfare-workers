

// export default {
// 	async fetch(request, env, ctx): Promise<Response> {
// 		return new Response('Welcome to cloudfare');
// 	},
// } satisfies ExportedHandler<Env>;

import OpenAI from "openai";
import { Hono } from "hono";
import { cors } from "hono/cors";

type Bindings={
	OPEN_AI_KEY:OpenAI;
	AI:Ai,
}

const app = new Hono<{Bindings:Bindings}>();

// cors
app.use('/*',cors({
	origin:'*', //Allow requests from nextjs app
	allowHeaders:['X-Custom-Header','Upgrade-Insecure-Requests','Content-Type'],//ADD THE CONETENT TYPE TO THE HEADERS TO FIX CORS
	allowMethods:['POST','GET','PUT','OPTIONS'],
	exposeHeaders:['Content-length','X-Kuma-Revision'],
	maxAge:600,
	credentials:true,
}))

// creating thw post endopoint
app.post('/translate',async(c)=>{
	const {documentData,targetLang} = await c.req.json();

	// generate a summary for the document
	const summaryResponse = await c.env.AI.run('@cf/facebook/bart-large-cnn',{
		input_text:documentData,
		max_length:1000,
	});

	// translate the summary into another language
	const response = await c.env.AI.run('@cf/meta/m2m100-1.2b',{
		text:summaryResponse.summary,
		source_lang:'english',
		target_lang:targetLang,
	});

	return new Response(JSON.stringify(response));
})