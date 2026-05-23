--
-- PostgreSQL database dump
--

\restrict eVSsAY4HTiXXuEHtyXCYG6KzAO3tZvAIo98fVAba08q0q4CTBUlmG6mwE3AX0nj

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: MediaStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."MediaStatus" AS ENUM (
    'PENDING',
    'PLAYING',
    'COMPLETED',
    'SKIPPED',
    'BANNED'
);


ALTER TYPE public."MediaStatus" OWNER TO postgres;

--
-- Name: MediaType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."MediaType" AS ENUM (
    'YOUTUBE',
    'TIKTOK',
    'REELS',
    'TEBAK_GAMBAR',
    'VOICE_NOTE'
);


ALTER TYPE public."MediaType" OWNER TO postgres;

--
-- Name: PackageStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PackageStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'DELETED'
);


ALTER TYPE public."PackageStatus" OWNER TO postgres;

--
-- Name: QueueStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."QueueStatus" AS ENUM (
    'WAITING',
    'PLAYING',
    'DONE',
    'SKIPPED'
);


ALTER TYPE public."QueueStatus" OWNER TO postgres;

--
-- Name: TicketCategory; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TicketCategory" AS ENUM (
    'BANK_CHANGE',
    'WITHDRAWAL_ISSUE',
    'OTHER'
);


ALTER TYPE public."TicketCategory" OWNER TO postgres;

--
-- Name: TicketStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TicketStatus" AS ENUM (
    'OPEN',
    'DI_BACA',
    'DI_JAWAB'
);


ALTER TYPE public."TicketStatus" OWNER TO postgres;

--
-- Name: TransactionStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TransactionStatus" AS ENUM (
    'PENDING',
    'SUCCESS',
    'FAILED'
);


ALTER TYPE public."TransactionStatus" OWNER TO postgres;

--
-- Name: TransactionType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TransactionType" AS ENUM (
    'DONATION',
    'MABAR'
);


ALTER TYPE public."TransactionType" OWNER TO postgres;

--
-- Name: WithdrawalStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."WithdrawalStatus" AS ENUM (
    'PENDING',
    'SUCCESS',
    'FAILED'
);


ALTER TYPE public."WithdrawalStatus" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: avatars; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.avatars (
    id uuid NOT NULL,
    name text NOT NULL,
    url text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.avatars OWNER TO postgres;

--
-- Name: bank_accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bank_accounts (
    id uuid NOT NULL,
    streamer_id uuid NOT NULL,
    bank_name text NOT NULL,
    account_number text NOT NULL,
    account_holder_name text NOT NULL,
    is_locked boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.bank_accounts OWNER TO postgres;

--
-- Name: creator_media_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.creator_media_settings (
    id uuid NOT NULL,
    streamer_id uuid NOT NULL,
    global_toggle boolean DEFAULT true NOT NULL,
    youtube_toggle boolean DEFAULT true NOT NULL,
    tiktok_toggle boolean DEFAULT true NOT NULL,
    reels_toggle boolean DEFAULT true NOT NULL,
    tebak_gambar_toggle boolean DEFAULT true NOT NULL,
    voice_note_toggle boolean DEFAULT true NOT NULL,
    max_duration integer DEFAULT 300 NOT NULL,
    min_amount_per_second numeric(12,2) DEFAULT 100.00 NOT NULL,
    profanity_filter boolean DEFAULT true NOT NULL,
    elevenlabs_api_key character varying(500),
    use_elevenlabs boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.creator_media_settings OWNER TO postgres;

--
-- Name: donation_media; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.donation_media (
    id uuid NOT NULL,
    transaction_id uuid NOT NULL,
    media_type public."MediaType" NOT NULL,
    media_url text,
    start_time integer DEFAULT 0 NOT NULL,
    duration integer DEFAULT 0 NOT NULL,
    volume_multiplier double precision DEFAULT 1.0 NOT NULL,
    status public."MediaStatus" DEFAULT 'PENDING'::public."MediaStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.donation_media OWNER TO postgres;

--
-- Name: game_packages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.game_packages (
    id uuid NOT NULL,
    streamer_id uuid NOT NULL,
    game_name text NOT NULL,
    price_per_slot numeric(10,2) NOT NULL,
    status public."PackageStatus" DEFAULT 'ACTIVE'::public."PackageStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.game_packages OWNER TO postgres;

--
-- Name: live_schedules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.live_schedules (
    id uuid NOT NULL,
    streamer_id uuid NOT NULL,
    title text NOT NULL,
    category text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    description character varying(500),
    is_active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.live_schedules OWNER TO postgres;

--
-- Name: mabar_queues; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mabar_queues (
    id uuid NOT NULL,
    transaction_id uuid NOT NULL,
    package_id uuid NOT NULL,
    ingame_nickname text NOT NULL,
    ingame_id text NOT NULL,
    status public."QueueStatus" DEFAULT 'WAITING'::public."QueueStatus" NOT NULL,
    slots_count integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.mabar_queues OWNER TO postgres;

--
-- Name: partners; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.partners (
    id uuid NOT NULL,
    name text NOT NULL,
    logo_url text NOT NULL,
    link_url text,
    "order" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.partners OWNER TO postgres;

--
-- Name: payment_channels; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_channels (
    id uuid NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    "logoUrl" text NOT NULL,
    "minFee" numeric(12,2) DEFAULT 0.00 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.payment_channels OWNER TO postgres;

--
-- Name: project_assets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_assets (
    id uuid NOT NULL,
    streamer_id uuid NOT NULL,
    title text NOT NULL,
    description character varying(1000),
    file_url text NOT NULL,
    min_support numeric(12,2) NOT NULL,
    download_count integer DEFAULT 0 NOT NULL,
    deleted_at timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.project_assets OWNER TO postgres;

--
-- Name: site_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.site_settings (
    id uuid NOT NULL,
    "logoText" text DEFAULT 'treetmi'::text NOT NULL,
    "logoUrl" text DEFAULT ''::text NOT NULL,
    "iconUrl" text DEFAULT ''::text NOT NULL,
    "companyName" text DEFAULT 'PT Asosiasi Karya Treetmi'::text NOT NULL,
    "seoTitle" text DEFAULT 'Treetmi.id - Platform Dukungan Kreator Terbesar di Indonesia'::text NOT NULL,
    "metaDesc" text DEFAULT 'Beri dukungan langsung berupa donasi, mabar, dan jasa murni kepada streamer, game developer, dan designer favoritmu dengan fee potongan terendah.'::text NOT NULL,
    keywords text DEFAULT 'donasi, creator platform, streamer, game developer, coder, designer, treetmi, mabar'::text NOT NULL,
    "feeDonation" numeric(5,2) DEFAULT 5.00 NOT NULL,
    "feeMabar" numeric(5,2) DEFAULT 8.00 NOT NULL,
    "ahuNumber" text DEFAULT ''::text NOT NULL,
    "pseNumber" text DEFAULT ''::text NOT NULL,
    "paymentGateway" text DEFAULT 'MIDTRANS'::text NOT NULL,
    "paymentSandbox" boolean DEFAULT true NOT NULL,
    "midtransMerchantId" text DEFAULT ''::text NOT NULL,
    "midtransClientKey" text DEFAULT ''::text NOT NULL,
    "midtransServerKey" text DEFAULT ''::text NOT NULL,
    "xenditApiKey" text DEFAULT ''::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "nibNumber" text DEFAULT ''::text NOT NULL,
    "discordUrl" text DEFAULT ''::text NOT NULL,
    "instagramUrl" text DEFAULT ''::text NOT NULL,
    "tiktokUrl" text DEFAULT ''::text NOT NULL,
    "xUrl" text DEFAULT ''::text NOT NULL
);


ALTER TABLE public.site_settings OWNER TO postgres;

--
-- Name: support_tickets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.support_tickets (
    id uuid NOT NULL,
    streamer_id uuid NOT NULL,
    category public."TicketCategory" DEFAULT 'OTHER'::public."TicketCategory" NOT NULL,
    subject text NOT NULL,
    description character varying(2000) NOT NULL,
    status public."TicketStatus" DEFAULT 'OPEN'::public."TicketStatus" NOT NULL,
    admin_reply character varying(2000),
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.support_tickets OWNER TO postgres;

--
-- Name: transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transactions (
    id uuid NOT NULL,
    reference_id text,
    streamer_id uuid NOT NULL,
    sender_name text DEFAULT 'Anonymous'::text NOT NULL,
    sender_email text,
    original_amount numeric(12,2),
    currency_code text DEFAULT 'IDR'::text,
    gross_amount numeric(12,2) NOT NULL,
    platform_fee numeric(12,2) NOT NULL,
    net_amount numeric(12,2) NOT NULL,
    type public."TransactionType" NOT NULL,
    status public."TransactionStatus" DEFAULT 'PENDING'::public."TransactionStatus" NOT NULL,
    message character varying(500),
    mediashare_url character varying(500),
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.transactions OWNER TO postgres;

--
-- Name: trust_badges; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trust_badges (
    id uuid NOT NULL,
    name text NOT NULL,
    min_supporters integer NOT NULL,
    badge_url text NOT NULL,
    bg_class text NOT NULL,
    glow_class text NOT NULL,
    icon_class text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.trust_badges OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    username text NOT NULL,
    email text NOT NULL,
    email_verified boolean DEFAULT false NOT NULL,
    otp_code text,
    otp_expires timestamp(3) without time zone,
    balance numeric(12,2) DEFAULT 0.00 NOT NULL,
    widget_token text NOT NULL,
    avatar_url text,
    banner_url text,
    bio character varying(500),
    youtube_url text,
    discord_url text,
    facebook_url text,
    twitch_url text,
    tiktok_url text,
    instagram_url text,
    website_url text,
    is_live boolean DEFAULT false NOT NULL,
    role_title text DEFAULT 'STREAMER & KREATOR'::text NOT NULL,
    is_verified boolean DEFAULT false NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    verification_status text DEFAULT 'NONE'::text NOT NULL,
    verification_token text,
    verification_submitted_at timestamp(3) without time zone,
    target_title text DEFAULT 'Target Server & Course Gratis'::text,
    target_amount numeric(12,2) DEFAULT 10000000.00,
    show_target boolean DEFAULT true NOT NULL,
    show_queue boolean DEFAULT true NOT NULL,
    show_reviews boolean DEFAULT true NOT NULL,
    show_calendar boolean DEFAULT false NOT NULL,
    show_services boolean DEFAULT true NOT NULL,
    service_btn_title text DEFAULT 'AJAK MAIN BARENG'::text,
    service_btn_subtitle text DEFAULT '(JASA MABAR)'::text,
    support_btn_title text DEFAULT 'KIRIM DUKUNGAN'::text,
    support_btn_subtitle text DEFAULT '(DONASI)'::text,
    mabar_promo_buy integer DEFAULT 0 NOT NULL,
    mabar_promo_get integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    schedule_title text DEFAULT 'Jadwal Live Streaming'::text,
    verification_message character varying(500),
    verification_platform text,
    verification_reject_reason character varying(500),
    verification_screenshot_url text
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: widget_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.widget_settings (
    id uuid NOT NULL,
    streamer_id uuid NOT NULL,
    color_donation text DEFAULT '#FFD551'::text NOT NULL,
    color_mabar text DEFAULT '#34d399'::text NOT NULL,
    tts_enabled boolean DEFAULT true NOT NULL,
    tts_speed double precision DEFAULT 1.0 NOT NULL,
    tts_pitch double precision DEFAULT 1.1 NOT NULL,
    alert_duration_sec integer DEFAULT 5 NOT NULL,
    sound_tiers jsonb DEFAULT '[{"max": 25000, "min": 0, "prefix": "", "sound_key": "coin"}, {"max": 100000, "min": 25000, "prefix": "Wow", "sound_key": "bell"}, {"max": 1000000, "min": 100000, "prefix": "Mantap Bro", "sound_key": "fanfare"}, {"max": null, "min": 1000000, "prefix": "Gile Bro", "sound_key": "epic"}]'::jsonb NOT NULL,
    coin_sound_key text DEFAULT 'coin'::text NOT NULL,
    coin_sound_url text,
    mediashare_enabled boolean DEFAULT true NOT NULL,
    mediashare_min_donation numeric(12,2) DEFAULT 15000.00 NOT NULL,
    show_queue_ticker boolean DEFAULT true NOT NULL,
    show_donors_overlay boolean DEFAULT true NOT NULL,
    show_target_overlay boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.widget_settings OWNER TO postgres;

--
-- Name: withdrawals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.withdrawals (
    id uuid NOT NULL,
    streamer_id uuid NOT NULL,
    amount_requested numeric(12,2) NOT NULL,
    disbursement_fee numeric(10,2) DEFAULT 5000.00 NOT NULL,
    status public."WithdrawalStatus" DEFAULT 'PENDING'::public."WithdrawalStatus" NOT NULL,
    reference_id text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.withdrawals OWNER TO postgres;

--
-- Data for Name: avatars; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.avatars (id, name, url, "createdAt", "updatedAt") FROM stdin;
2b281857-1a77-48e2-a12d-fc6f713df8a1	avatar-default	https://cdn-storage.treetmi.id/avatars/avatar-default-1779185520201.png	2026-05-19 10:12:00.399	2026-05-19 10:12:00.399
8863752f-dbd1-4cb7-a739-5c7711fea880	avatar-1	https://cdn-storage.treetmi.id/avatars/avatar-1-1779186236459.svg	2026-05-19 10:23:56.745	2026-05-19 10:23:56.745
10fe7bf7-f46e-492f-a964-16dd950cc93c	avatar-2	https://cdn-storage.treetmi.id/avatars/avatar-2-1779186245863.svg	2026-05-19 10:24:06.084	2026-05-19 10:24:06.084
6500e63f-21f0-406a-a2f5-2339989b954c	avatar-3	https://cdn-storage.treetmi.id/avatars/avatar-3-1779186255511.svg	2026-05-19 10:24:15.706	2026-05-19 10:24:15.706
b4dde64b-e1f3-4c8b-bf4e-d5f92cedc189	avatar4	https://cdn-storage.treetmi.id/avatars/avatar4-1779186265096.svg	2026-05-19 10:24:25.222	2026-05-19 10:24:25.222
768f01a3-0a81-4ee7-bfcc-2b70e1635bec	avatar-5	https://cdn-storage.treetmi.id/avatars/avatar-5-1779186274787.svg	2026-05-19 10:24:34.966	2026-05-19 10:24:34.966
660060bb-e051-4477-9e18-f5e710c455ed	avatar-6	https://cdn-storage.treetmi.id/avatars/avatar-6-1779186285176.svg	2026-05-19 10:24:45.363	2026-05-19 10:24:45.363
722e9d48-b3e4-4f89-9e36-a2a626da6856	avatar-7	https://cdn-storage.treetmi.id/avatars/avatar-7-1779186297891.svg	2026-05-19 10:24:58.001	2026-05-19 10:24:58.001
c011db68-4f61-4fc5-9373-95f201a2121b	avatar-8	https://cdn-storage.treetmi.id/avatars/avatar-8-1779186306396.svg	2026-05-19 10:25:06.529	2026-05-19 10:25:06.529
\.


--
-- Data for Name: bank_accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bank_accounts (id, streamer_id, bank_name, account_number, account_holder_name, is_locked, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: creator_media_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.creator_media_settings (id, streamer_id, global_toggle, youtube_toggle, tiktok_toggle, reels_toggle, tebak_gambar_toggle, voice_note_toggle, max_duration, min_amount_per_second, profanity_filter, elevenlabs_api_key, use_elevenlabs, "createdAt", "updatedAt") FROM stdin;
854fbca3-a3b0-4f60-8ca1-6500a75d8f0d	ac77b60f-827e-48ab-81e2-266149e36f3e	f	t	t	t	t	t	300	100.00	t	\N	f	2026-05-19 20:47:51.148	2026-05-19 20:48:23.721
\.


--
-- Data for Name: donation_media; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.donation_media (id, transaction_id, media_type, media_url, start_time, duration, volume_multiplier, status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: game_packages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.game_packages (id, streamer_id, game_name, price_per_slot, status, "createdAt", "updatedAt") FROM stdin;
9ca663b3-23ba-405f-ab12-2886ae7ad359	ac77b60f-827e-48ab-81e2-266149e36f3e	Mobile Legends: Bang Bang	10000.00	ACTIVE	2026-05-19 13:40:28.078	2026-05-19 13:40:28.078
\.


--
-- Data for Name: live_schedules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.live_schedules (id, streamer_id, title, category, date, description, is_active, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: mabar_queues; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mabar_queues (id, transaction_id, package_id, ingame_nickname, ingame_id, status, slots_count, "createdAt", "updatedAt") FROM stdin;
c619f334-6bee-46b9-bb15-21fcaa2d663f	890fc248-58a2-4e06-b2ca-48353a48c6df	9ca663b3-23ba-405f-ab12-2886ae7ad359	Andietz	123467894 (2082)	WAITING	1	2026-05-19 13:40:51.2	2026-05-19 13:44:24.973
\.


--
-- Data for Name: partners; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.partners (id, name, logo_url, link_url, "order", "isActive", "createdAt", "updatedAt") FROM stdin;
77d6f4e2-a413-4c00-893b-ff009ee24ad9	Google Developer	https://cdn-storage.treetmi.id/partners/partner-google-developer-1779226000781.png	\N	0	t	2026-05-19 21:26:41.194	2026-05-19 21:26:41.194
2cc028e7-f48b-4ab6-b633-f1e31de1f2fd	Cloudflare	https://cdn-storage.treetmi.id/partners/partner-cloudflare-logo-1779227774777.svg	https://www.cloudflare.com/	1	t	2026-05-19 21:56:15.622	2026-05-19 21:56:15.622
32531f1e-09ae-474a-b536-7572d1c50ec4	Komdigi	https://cdn-storage.treetmi.id/partners/partner-logo-komdigi-nav-4-1779227887718.png	https://www.komdigi.go.id/	2	t	2026-05-19 21:58:07.9	2026-05-19 21:58:07.9
\.


--
-- Data for Name: payment_channels; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment_channels (id, name, code, "logoUrl", "minFee", "isActive", "createdAt", "updatedAt") FROM stdin;
80b438db-d314-4516-98a7-82486dabed93	ShopePay	shopepay	/uploads/payment-logos/logo-shopeepay-1779189078088.png	0.00	t	2026-05-19 11:11:18.13	2026-05-19 11:11:18.13
8aeb896f-8a4c-40ee-af0b-81fcb50c5272	Bank BCA	bca	/uploads/payment-logos/logo-bank-central-asia-1779189101256.svg	0.00	t	2026-05-19 11:11:41.293	2026-05-19 11:11:41.293
2e099869-6633-4c1b-aee7-3c7f327eff41	Bank BNI	bni	/uploads/payment-logos/logo-bank-negara-indonesia-logo--2004--1779189119015.svg	0.00	t	2026-05-19 11:11:59.053	2026-05-19 11:11:59.053
0908ab33-e65b-43f9-aef3-6f730acdaa76	Bank Mandiri	mandiri	/uploads/payment-logos/logo-bank-mandiri-logo-2016-1779189133445.svg	0.00	t	2026-05-19 11:12:13.482	2026-05-19 11:12:13.482
e643dff9-9630-468d-833a-67902339b531	Gopay	gopay	/uploads/payment-logos/logo-gopay-logo-1779189154435.svg	1000.00	t	2026-05-19 11:12:34.472	2026-05-19 11:12:34.472
6f283855-e2da-4a8d-96df-c35e985d7451	OVO	ovo	/uploads/payment-logos/logo-logo-ovo-purple-1779189174476.svg	1000.00	t	2026-05-19 11:12:54.514	2026-05-19 11:12:54.514
9aa78660-3b85-48c6-ac5c-c2f43fc04da7	Dana	dana	/uploads/payment-logos/logo-logo-dana-blue-1779189190260.svg	1000.00	t	2026-05-19 11:13:10.396	2026-05-19 11:19:04.773
95085222-9389-4222-84b6-d70e1eb7ee68	QRIS	qris	/uploads/payment-logos/logo-logo-qris-1779189202667.svg	0.00	t	2026-05-19 11:13:22.704	2026-05-19 11:19:19.058
\.


--
-- Data for Name: project_assets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.project_assets (id, streamer_id, title, description, file_url, min_support, download_count, deleted_at, "createdAt", "updatedAt") FROM stdin;
d0162b90-20f5-4a6a-aab6-1f2241104677	ac77b60f-827e-48ab-81e2-266149e36f3e	Tutorial CPW	Panduan Isntlaasi CPW Patcher	https://drive.google.com/file/d/16beRPFOpUKQzeEUJJOaEHcVLzSCCU2sI/view?usp=drive_link	20000.00	0	\N	2026-05-19 13:46:12.001	2026-05-19 13:46:12.001
\.


--
-- Data for Name: site_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.site_settings (id, "logoText", "logoUrl", "iconUrl", "companyName", "seoTitle", "metaDesc", keywords, "feeDonation", "feeMabar", "ahuNumber", "pseNumber", "paymentGateway", "paymentSandbox", "midtransMerchantId", "midtransClientKey", "midtransServerKey", "xenditApiKey", "createdAt", "updatedAt", "nibNumber", "discordUrl", "instagramUrl", "tiktokUrl", "xUrl") FROM stdin;
6d5cb7c0-b7ad-4cbb-8747-ace57cf62472	treetmi	data:image/webp;base64,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	data:image/webp;base64,UklGRmBPAABXRUJQVlA4WAoAAAAwAAAAswAAswAASUNDUMgBAAAAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADZBTFBI3hsAAAHwRtu2adu2rbU+xuTCtnFs27at+8u2bdu2bd9t82Dbtvdea02M0VvJKf2opbbex1zXCCEiJmD5/37ulpOT5eTkZDm5fPXuu+56yLW7H/LQRz7snmuXr9917733POQhj3r0Ix/76Ifdc/2u63c/5J67775y9frV69euXrl6cvnKXdevXr927a5rd991/e67T65evnx66eSQ3X87dsty0lx9yCd/w2/+ph/6Rb/8d/+1f/HsZ73m3e/7yP0fuvHm997/4ftu3H/r/ffdvHHz/PbZzfPbt26d3z6/cev27bOzs/39tx64eevWA2c3bt687/5bN26t57du3T67fX7j1q0Hbp7dvnXjgQ9/6H3vfcfr/+MLX/SP/uhv/tnf/0d+6OMesizLyYNtWZbLj/2mv/2st37o1s1b614DjtHoaqX2UUPUSipBTBWqVaAaiEjFiFQ8vGq99dEPPP/HH/8g2931pX/iuR88syWrQgWIFESlyECMYhVVGFYEKhEhWZNSCBFMioHIQKnrmuB9T3/kyYPm8pf86neeR8VaVwj2gG0UVeyxpTwuYo9HX/clrt73st/5CdeWZdndaY/8I+9brVhVUFRRkiEKKiriHM0QRZFJFMV4B66ASKjbP/1V15bTO+v6r3m7tZ7XWmUqmGStfURN4kgiMawMkiiGilFSKgpimTUNBKNQDaIilUqVgT37ykf/8g//2EPvpC9/I+v5+X6tMhAqRZECVQSFqpRiKZNSE0DFYIugVBhE4kiHI8C617WK87Ost9ezD3/oad9+eqec/FE5X89rPcNgjEkqlEYViEp0jYICKqRiFSBYyqAGFMU5mmbzahms81rXs1rPz2+98+fdIZ/y1lLFragSN6OiIthii4pq7BmM4sXjRlSL2+/7kWXZXdjp933EvciAghER20x6FGSIKhhbYh9FBdukQ+UwFWgyrGtx/49fXS76Yb/ilmdBiaISRWN0VQVriIJthp6IUQ1DDW00bsRDMd3GUvd1nvrgn/qkC7r8rJVy9cjxiDAcMfZlj0dmy5QGRbXWfYg3/+mnXczvOK8KMKBswJEBrdnBEUVrQLmoI8Y+nbWm1lrrNXddxLfelzXJ2mEL5YiVLo6YJlaDgEPEMaoUqGilYcIEZYC4QY1ZWc+zr6pnXT3er7l5dr7PvvZuxJ7hcBjEOW7GHlUUPHC2HQVd0YjZh/15ud//+aN9zVmta61rUOkuGC+aZmsOuNCogayu7Gut/f7+zz/SY94W1HgoWzgAj4vKpKdB8UGJSWX1vx7pb1kBKogaFecMI0bFHiXSoKIBWxqiqGKPZuBIKWVgwFQ0Sd3+3qN83MeCSgRlQLEUFXQdggfGjaio1SiKPQZrOH6arTimSlnd5+VXjvEs13UAwe14bJqRTmyJigq2qCgXo0IGmjGJe6FM3f6OI3xdmYopSzNj2MqAplEOimh0EHvs8Q5ENRq6ihJFz9b33HPYS639PkhhUImiijWJohr7SrfaE9WyNKproyBq0iDKcYCoRlFMUyZkTX7RQV96s2pdMRoUVKlOzSBuJnY4LxVQGPqoA3jxQYOCg1Vaialy77MOemad72tVRLHF4zMIEbeDqNiSZkRRLgxUFFvEiJWVfa314bsO+GIxMWiJ21FpyCYGFdgSL5ASj4rK5LgRUYn8pkvb/pNoLJLEFhVl0BId6IiKhlRFRVS2oCgCamkDaNSazBmQ6mBAA0aJ5fOvbHr0uQiowWQoRaVExVJUQUWq0dJya5Co2GiIY0GpAqpJDtk3kmZERQQV4EP3bvo1qlioKINiy6DiRmxrUJmhiuCheKGI84hbV0txSs5+7qYXmjKwGhJN04a4MQNDYuxRJjWJZkC0ZhxvnqCiabBsQcsyL97yiPstzRrBYNykBghlIiqFKEbFuHeaIURxK1HRMGFSKmC0MLUvgxEtTVxFcY2EJO+/e8M3rwSSwigejFgaxZ6oBBxB1CBmUGJmqEbRdEqzNagCmmhUgCQmmDWm5MaXbvjjtxsrjrAF1BhUcZqICikGHIcRUMU0UzQejChOEaUkjgTbIhoM/trJbvmlTlGjssFhe1Q8KraJczwULz7GgzGgiurrL3fL8swNkCCiNAEVGUATqtBCaegSyyJgUClFg0bFrRmYMUHLtcIGRBJR0rztyuwtA44EKQyFqJRGDbqiIlGdxI2oYozqakvsS+lwTAfQlGOIPY4Ig6L49rsm97x/UAGNczwmHoo9jqjG84FOjYgyOxg3Um6vBEtEbN/x8MkjP6oiWlYoRcUpDQOCNEwwiptLBFSa2OOxZ6gRmSCgoiiW8p7Zx92vOKImlIqgDEQVqaJCskc1lqKaAQXFWIpqGlmbQBNyQIyKSqwYokGxiCnLEfCBJ06+8NyoIkZXxB4R4pwIuBFHFIYW1dhmiH3wQBTssU2hYqGowKCx5dYnTL4bbINjNhyOhepKEy3VKKpRhqiixaA0F4nTEiOJLaoYMI23P3nyp246BY0egckUtxK3RolKpyLigTSwZTt4YIw4Zf/5k7+2dhiSws0ER6RDFUXpIgOOIREEELRWWyZBQVAZsilmhQYV1XKghjr/7MnfqQZRQUphbSSKPfaooqjGblqrRCEY1YjiGNWoaIzt2oFjiXNUBKKIur/1eZO/l0YTtURxMx6bZjuOwzw6bMYp3YHBzbGwxGnq1uc0u+WfraJGi4RSVFAGHHMQbmaGuhdkVVGkGiwa0eDFZmLUoAzRnH1Gsyz/siIqIRosNbaoDKhBVGqWLk5DMEZW1KhRShVWJqUgDSIqShBFNBpAJK6ISnL+SZN/WwZRylIcGdJoPC72OK+gaIJtHNFye8pDsWUtx0JFARNVBNzf+oTJf6nYgoIgDNgR2QYz4naiqJIBp6gisx42TFFKHHEeVFHq/OO6k+eWU9BS8Y6MBzJoSkRFHHGEMg0deMG4tRlz+wu73TMjXUJWVKkJHQMNA85TqGjUCGCLqBTRmDhCadB45KrqRoZCFYb11md1y/NVIaKgBE1pVCOONZuiUYlbY0gGnIIjBLFFtSANylCNMsERUVRLa3//p3Qnz8E2AUHwwE7x4LJlQxmVgKI4xXnciBePUY09WT/WnS7PSqcxIRpNVFRQFOc0UWmimcRgQSQCioIiBtvEqHhkmjQtikaRuu/jmmV57hpRi6BoqYI9VBSkmFSXDFq2JIJJadRELU3U1aylBkRTIg0NkgQUVTQQVQyqEe97cnOye/5qFDGgsd1E3I59oFMUEQTQCKKoqEHFPgoeORFVFBWQqFFAPvyEZllelNjGFhUPZYItw3bsQzSqwSi2RJVuzv6guDnO4zwPPHrykr3TQtL0qFHjiBePisfGlghq4tHppjGqiAqfOnlRiQyRFLbMUC2cwqYolYHBUjFNFCWbkFRX4TgppxmQCqo1VH3K5Dk4ogpCKUNUIaiiGUREGVRkaFExKqpRbHFEFVGFI21lsEBRQKlbnz55QacFGlXcTKPSbGVQmGAfVBSPiCKOx2DCBIM4Jzn7rOZ0ed46sSwojSoN4hHoepQBVbCMRlFFkaaCI/aHoXQbo4o0KLc/sVmW51eaEhSM25JqEAQl9lGjlIqaaIQSUKNGY7dXrSSotYEGQRWZRAMSSwGMtz9+8pJVBoxo4fxcFZkcE1Wcg2IUjeKILSqO8cCuD6KCLcQEW9QbHzd5ZaGoGXDLKuqAx0VUQWQQcU4GHLHHkY6mj4o64DRqBMX27Mnd7nWr06jYgoqmUzmAYYy4GURUwM3B4NZ47LgZVdy6fvHk1UEaIOuAlhrBaWyTCGyxTIOaCJZjiQrIII6obGIbEg4hiloD55/fLa+II44g0RiNaDCDWioqqkxwKwiUimTAFsfYokg6QSbxiCEYjSjc+JzJqzsFFPFQmKC4GYwjk2nFQ1FFFDczXHA0ouLIrc9tTpdXFYLqamKEAY2W2GOPotgy4BTRIoAiMwVrUJngEeugoCIYzfAZzbK8rOKIoiBOwBjWASGDxh6VQLoQgwFFTdRSUaNrGgkanEYGhCKahAYCgqUoxvPZK1YzaIzGHg0xYovQ4IiYKEZR1KCIooDbAemcg0qcE0RtUIagxJGzT528PtiCinQKopJGY08ltsR5VBHsSzPQRBXFEWl6tjhUmikmKoPrJ3UnP3XuNGhUFHtwii1eJPZ4wbg1XjQWILZnn9BdfskazVBYwRY1xh5RVECBbIjMFHBKQxqAJtgWM0RlQDJhkopopTmf7F5czkmA0lCKIhrZYOxrUnY0JpIB+wYTRRUZSBrX4FiOeGgQowElD3x8d+knZwGNczwUD2bocXNhm0HxQJqtcQ7Y01EYUVBN7v/E5mR5yV6NaJmipFRUNKIYxBGDdIqaQSU0SARwDhpFhuOmMapo7KMS0cSo939csywvHVBCFEwU4oiVUjGWRkPZx74aTUTDikGsmRiTVYWIJpYocTUKhtDBEA0ZStEQbz6pO3nZmdiGaCmg0TgGxZSUI2aSbp4CFcGRBjU44hxHYo8jgiPYkphoiIje97huefUaBQ2KW9GolHMGDQ1siiaIU2aKPc5RRRvsE1UGJypW1Kh4/6O7y68tp0GRWYtKhz0eSDNihypuJ6ktR0cVtyO2qNx48q659OqAikaqEMWoMWQS+8QRpSET1Eg8kDREHNmUo8TtmIql4PDhJza75WccQRXAaAZEV0UyRCX2UVFXe2wJNDTYoqWlyAR7JihuziAiIGH4yBOX5vSVGZQEjXPcioIjynCRFB4fLxTYMlIIqKjChz+uuby8dojRci1LGXCMZSIljgiGQ5gwFLg9ShMvOBp7ZmgiGkT52BOaZfeKwrGISixnoFVRYlU0WATboBjjiMZILI1KNRoRJSoiB2DUMknoFA2W0bBiFPDm45uTk1euZsASLTeWqIhonMYpwR5bVLEFmagREI+KWqqYqGjsE00hIio3uuXktYWKFkLMDA9MDI7QMZsWqjCo0GGPx46bUZiMSCKqeOtxk1eX06CoqxpxRKURjxk2jah0KsOI4sE0eChux6id3v/YbvcyQRQTU9GYlGOwyaAm0IROkxqiGOcERSud2DKhQzwweGgJSjUfe2S3/JQtqogJSVbFYLQIqKUKojohug4iokiplkYlyqQ0ZpIMmkMORppkyIcf1u1+ppOAokKc44iKxw6Nii3IgKJg3EwjeDhwAJZGFBz56GOak+UVUTBaJpRENA1dz4DKBBUPQSGxi1G2zQ9D46GoQRVF+dDDm2V5eRxDghLjgIgaoiIkQ9kjqElqAgqKRmNqgFIlRYNRNDKQBlVEmaCrESx0wPtmL1tBUSNaWCAqKIUtomjolKiCLc6jElScRoI9ioriyDAiaDSiImqCyiAfmb0icQAcUVENjpONIQ1AVMLQZgDHEPtynM0TD2kRsUfUQsXxvod2V16D06hR8YiIqNjjFA/G46KKShePWgJxDiA4tDn77O7Sy9xCUKNWAx2stgkaqUkSUakBKBQJaaCbp6IIHGVNVcGAbdYVozLU+ec2u5Of6rBFULJXVErFiEZ1VUVKUSmaETVRVLGrSRTVIYpwQGwpWzIQUQbU/WS5/LI0yjDHzfGYWIrHpIkMdzqOGMcIRpyS889rTpeXl4JorDJNYBslW0JzbBR7BhruADQRI7gZYUBz+zOaZXl1oQpRLSVKAg3iWAZRDBJKYiAWHSUaotGIBhQFkyYYTYxMUBGplGIURCAaVzs4/9Rmt3vFXmwLNKporBrUiGI5RZUkoqKiIgOAI6jiWOIcFTeiYptExJQjoCuCcawbn9Asu9eALTiiGnWfyVYGpNEmcTtxTCWDYMtsI4rbAaMoKmjUKqfsn9hdeUs5jRo3AgYRFYyaTHCwIqCiqETBrVHUxB4ZwI10gIgHBs3MfFZ39U2oDEhKRYlaoVQwaIOaaERULHAOlsQRjaYaYktUIoVGzRYFqqMBCANp6tO6S28YFEcQVEo11CoolGAf1bJbExQimFRRpVAqDY5RVIsVNKtxLFGxHHG+2iYGlSFnn9RdmwiqaNwOtsEDQUU7ezSAPUYZUFExAUfMsJ14aKJdf7vbXXpddVqCcQQ1WokyHjbiVhSNERVFRYPY4pymZwMoKhtQozXh9uOb5fRVRQOqKaPGgHElCRpJ1BKDooAWWI0YqYRENKCWqIjFgBjHLqYpQzDDxgKI5ez8cd2l15cMimrZRysIscUQVRTHBPsMiiCAjCp2KNijuBlFHGNLE4ImUaNibj+qO3kL2KJGJkpElWZzZUhsiD2OiCiI2/EOREVxilFTTtk/orv+jnIaNfY4gioKEBUkKhjVRBhQMRHFjWywQInkIAaUKHgwMvPGQ7urbwmkARjiGCHEEVAGMYk4YogjKLqviApE0aBoEdugDCiTjch6EBVQ0jxwT3fpzbgxRqO6qoJRBMpkwJ5BExlUVM/XJKqlUY2KGkERY4dbsWwzYxILe/KxybW3ZxJVlDjiiNgSD45GMxspQiSslH0cEQUtL5DgZkRj2SP3dbvL7yhR0TKxNCAqqlEkIg1KVAyIiHRBLYJVJukU79SgskFUcOuHrjXLpXeV09iupbGkS5TVUErUoBpRyhg1ojEr5SqJRU2illapMaJGBpCmJCMqDVJGi3WCH7jSXX3n3nSIFgYMKo0Rt0ZRAVGNxq2A0bi5kCpxxCNimxUHoogprIojqu+92l1+L+mioopt7AMNnTK0OGcoUJKIpDYoajycyTQqGntUI1Fx/ODl7vpbCvuoUaOiopSKRlGlUVRQ0GAPJEKpqKhMyhIlJhuOi9sREfuP3dNdeW0JKgRSCGoNENRIYhtB0mhMStSKapFEFEhT1RD7QodwSAYkbMOUotJ84O7u9LVRxZZoYURjtDRKUBRLES1FtaKKDFChSjWgIijEQClCFIEOGQwqbgRRgpZElbztSnfy6hqUCoqKinGOauKwkQEtGEZEk1IgCiioSNQgKzhONmJtEyER4zS++1q3vHFtkBKJIJQqgkaFklEwiigKEduYgEVCMKhoKYqg4AXGnokaFBSDiG8+nbxuZZCgQ6IYVSLiGInraiy0BJAylhLRkDJEaoiyVzSsZo9aFkNME9NEQoaNUEHjGrB51+yVe2qQGMWNZSl0UkkcKyqEqKCxrQQIIBEccUARRwQVBfs4JtEKZgALTKlBVF+/mzw3UZFEwTnEwq3BEQocERRUUYMg6GBQUTDgiCMqbmcAEUURLVVMUFB81YY9iiroJrfjFMdgC24tFbVU1GFKmqNmOCqOEbAFX7BM/0R1EK1SzNCmA1uIiqLRGEJmQuxRjRZd7OsIsikZGPqUBFOO/2b2c0uxB7EUoyiUohqNGseAikoJaiFCaoWgxhFLFLIqKqtp0iX2NFvDEGMiMRp/9+xLz+0LFQ+PGqXUOGIbLYXSOGJUgyWIiaCKAopGhiOnYVAhEcspfnu3Wx7xETWiZUINdAwtbg8GVco4MgiYEIwQUaNEjD1eNEqnKBEVo356t+yW1+KYoIJxxB5ooCIqK6q4VlIp9gxoxB7VodSAJQwRQQYm6SgGEVEhNiuqGD9xwx8lGjWqZR9lUDEajf2AUo6JiQpFVMA2iYokpUqc4makURgkKGrEigKC3nf3ZNl9w7mIooLQSDy0kCGiimZAYxuIVokihaiUoFLekVGwRRWJfb1vN1se8j5XVijU1Y0MzAqnuBk3goqICs7xzsbtGEiwjP962fqfrVCsgTUqSlQUp2hUBFBU1FjQoAZAVOzhGFFWOABUNPaoqFYJWbWsn7fp14uaKApoCKKIRlFdGRTV2FJaCihKKolqOmOPMmCbTajGQ3GMSKSkPPvETZ9y7oBoiaioeGxsgyOxT2ybEUfEA7FnUoMiNcGWMDj9mZNNJ880RjBhlU0MmWSAmSYQp8iAqDHYximzFtxIo7EFJyqIZVH1I8v2H99HyojGOEZFjXHEYtByRFSM1YREJUZRTKORITUpBTEN9kE6G6TIUBjwIw854N6fqRVSRFdAFEWGPm5FFRE1ZlCHEKMSZIjHxmOWSgcKmsKx/IvLgdd/xb4gaFQ8NjNs8VDssTFD3JgDjoojOMURtMCvOmRZnr6er1mD5845BI/MLE4xqrgdnHIRh2eIVtY1r1gO/3JTqSQVGFBRGVDsETag1AQVDfYddEfkOJhsQlKBva71pUdYfspyLIJiFMUo9hnUbFBRmh40AxrVGZpthzP0zDRirKxnL1gO3y1P/kiBES11eBBiC92DkGrmmAGUW599hGVZvqIsE5BhO9tQJgxsmccHa1TZoChoUv98OfI/NxFjDoA4YjUaeyZp0HRRhkxogIaL2IqKCarEN917pN09/+RMFFRERQYVj42KB4LHjBfJFmYqmtJC/cgnLEd/+Aui4DwePcyOuyFb7mRmKiLCza9eLvBTXqJnlBH3HRzl4ukORO6QA7OuVX7kV+0uYnnsK9d9BEzEkHKEATVGREVEiQwMAE5poAF70KigHCPIEEArxVne+o3LBX/mi7JfUShwLIloaakG29gSZqhSkiH2DYri5oAjExpdFdWAVet5vf0Llgu/+ymwelzwYOybEUcYtsc7FlUUx7DGlz96uQMf+ntulAQ6ZDJnQ489bgWFDRwECkeZD9H9yusft9yRu89/MxKTQSUTGoUJg9IciAejteH4dDhSwr++d7lTr/+b22qkAVsgMjgwQZxHFEThgEgwFxY0apAkvPubljv2ZDn9nn9zjhNNo3GOI/bMDs6WFqccbWyM8YFfeNdyB++WZff5//y2yb72Z1QFqSAqEtQEUFYBNWppCiwQIGIISGIZAKFi0oEatdSoIBXd/8zPurLc+Z/2B1/zwXNTiSGoOEIVqBBMVqKCmmAkGBJTmGgwUVhN0DUmwThHbJI1e/Wj//qrri0Pzrsf+/3/7l03Vq3s1/1a61q1SpICQxJSRehN6rzWrEUVRVWtWQlZK2ulqkJIVigKiyRrsmZd9+crtSbq/vW/7pHLg/rqp3zLH3jh227tK0RFZV0rWnVeWbXW80oRa12ral3X2/u1sta6Xwus/bquVbWvfRJda19V1L7OTbCyUmtCXOvmB17zN37xV15e/hu4e+infdVP/PG//+xXvOQ977/vgbOzsyi24GYMgjGxj1WqeIGRcH7jQ+956R/8Dd/9SQ9b/ht7eu2eRzzxk7/gW37kKS9+5jOe+ZwXPu9pz3z+817w1P/ylBc//dnPes5T/vMzn/WCZz/zOc/4r8968Uuf/8LnPvN5z3nxi57/jKf8+//wH/7zv/93/+Y//dt/+a+e8vT/+l/+y1Oe/oxnPu3ZT/tP//Kf/dO/+/f+1l//s7/nt/2W3/Ebf943fvWXf+rjTi8t/209WTZfu3zl9NLV092l5dJuubxs3i3LblmW5WQZd1fuOd2dLBsvX7+yW06XZbecLstuWS6dnizbT5fd6X8rdsPW3W5ZluV0d7Jb2pOTbrcsJ5d2y3Ky7Jb5leVkOTk5XXbdyeVld3J6ult2S3N6+eT09PTS6XK67E4uLf9Lc/ffKVZQOCCMMQAAMIMAnQEqtAC0AD4xEodCoiEMPkOkEAGCWxAdOEAwcwlbpH8JWLDPmJr718eB/Kz2Wa4/Yf7V+eP7f/0P8r8sOszm77Sfa45Y/0n9x/a3+2//////dT/H/8b8u/kv+Y/91/dfgA/Tj/Hf2T/E/5//Qf///4fWD+zvue/tP+w/I74Cfyz+r/6n+4/vB81n+R/b33Rf5H/Tf8n3A/6V/XPW9/7fsT/ud7A/9I/wP/X9bv/z/5n/jf//6Pv2f/7n+f/fP6DP5r/Zv+H+2P/0+QD/q+oB6AHWS/gB4Pf4H8hPN/8g+Zfsn5G/27/1e+nlb6wdSP5L9vPu/9i/bn+//uZ8u/8LwX+HX9P+Zn+H+QX8a/k39n/tH7Mf3n9u/dJ2xevf5f/reoX66fP/8D/ev2//uv7lfSR89/y/Rv7Af773Af5d/Vv9D+Z39x///2B/z/DD+9f8f/me4H/Pv61/yP8d/fv/B/yvpm/m/+L/mP9J+1Pt0/P/71/wf8X/qf/f/m/sH/kv9E/039y/yn/i/y////+P3p+wr9uf/D7m/60/9b8/3oNGbZA8/0B6in7pa2/Xm/KJkvatoR12dBnEmiySVqkrslH5iCuYP1OCnndmb72TNqL8bO4yvPXVQ2LyYTb9DgXZwJzYFpCyF19EYYlYxXRMLO6JzQ247PX6JH8xTdeAbjSz8F78cVrLr//4r6RwHvGwFWqCG47I//pjcUIdkNTCH/sq4S4kN1XE03HN7Kl3vM9WpSMqIT7JWt08SCHaAKNhlKqDWi5AUIUzexqf/98J7bIw152sPmDDG8ytW+eOTWtcha7p5TZMctsESzOacqpfgpzh6wiAA2gAXg35GphK3MYdIr74Z2XGlWI/ma3GIqJXb9ncEocfr6/M62NsDNszTbMKrG9VFHPeoc+l8jYPmOM2+i2GB8b3QHUitRObnguxj5T1e6musRqa+WTFNaaSZfBKIsePEVZJq9TAl0nvmzj6m22H3le1+5ddqxfll+uV/1Kl3/HbbeGbCbq/YM3IkgvnB4Cf3BnyG359qdJzgbib0tpQ+scTh+2TAMWA+gRJb+kbX/BsTI8MRHUZ2SdS3KEONL78Ve8rHYT2+037o5GnCF3kSVxv708sJXD3/qmBn5es2vTqbu67MHPVxdQ8UXGn63ULPFsdo/czPoE/4TWxckw3rt5ypxqKqdfNbHQlRw28iIgQPZcP/+pCu0M3StQY0WMyxNEjkEhxWfmO5cUYsEd43RD2sCzJ6sC1NWEqncEeS28A19lNG+AEKUu2kA0b4zCsu8nY/JNrcnyIEZJ60FoRm3D0+Z425fycHgSrhs/pSykKH5t04eW61b+yEi/ui9kmUnDJckNnpsMpcMEA2597fFTVtbXnSl/3hB5o2sdjtP5jZXLSWJHqfAAA/v+Pviv+4g20tGh2MNgK3Jj3WRhscSSfgo/HiHvYdKzDDqNwR5lPsX/XApNCzA/kyfBEzE69jW0DhCBu3+OeO3gYRpovk4gh9wA8N34Yb4KPVjjTZywsGdHc+mb/1QxPFGwfJ/WmqPnveEDayNi/dObAFXinaDZBNaIxFo+nEj7zHIM5h3md8AvjRuFYhdHyTuIjYcA0cstl8IHsP50ZFh2IRubEulTdva9lAibJ+pcxUlF3XbkSzEAI+k3ifxo20t/G155ZMaq2PhmO5hRcrFubejtOAomce7sZZZLgIN90rp0Hfy/7ahJapkpKIUI6tqeGh/PAB6Gp9yN2f8L6LaOibQ4ga/GQo06p2dWEK5jl972pBEoVOFX/rZJNHcaEwfHjUQXtr8yPlGKMy1sBChLHI4a4v85yjTVYVwZ6HDPCgvo2Jm3ETxAOtF5lP6Gz0KhtEgycZhuOZyirxFW/5BjY8kW/k5Q2hFZ9L1BUMc1vphT6zJqIatFSr5tVJWzP/gLiblfGje9X08gHylc2TyD5PykK7lPdylniDzU0//eIvCQ3/e7hueHO9YNk/lospa8cf5PP+ZAHwi7aRNhRAMMdUVNCUAQBnS6CCatPyrKa00hhSO2A75965v11jx2t32Ym3kgWwBtcv31ihetUgHVokS7oHUQekjYgqssUWNGWUdesUfLEFz4sR85Q54jsKXL2kby3L3Yk3YshySLZkfyRxz4lxn6cZEhCUAdchXQ8+bhYeLGrALUOH3G/tRogLWzAMf+3AkRm+X3bhjYzuJls8hvpxz9eK54RGYtEqbxrLDy370bFMAu9o6mRZ39O/HQ8zTI6twVz3oaBglH4N9xLIb33JWX7kCjaxBJRGfTpXbsjvjae+JhoJh+Cx5Y+kAZ2qN9e1oiEi/iXiZjnIBqe+KDJ18bm8PBFneh6MNNoV9I47ONJ+tXXFGBT8yQgJ73mosygflnPFYazA8yCMrNXRL7NAB91S5/h8jIDlvXZZeNU2VD1Y9tKvRAf5F4Z/OC+g2ABnNl5GIwVcPs8sVlG1e3+fx7+IDuKvDX/os3APHjME3mmt6TQuRvWC0aZ3hIAoQP6HGk711/RrsWKBWbS5wr+VEUyA5+RztAMu0gBu2NZxleNu4r2ntL2Bb7OUkQZgqkLQUkfQD8H2qgI9qcrtVw0PeH9YHuigpSoOMDy2gawkP0tPnauYwyrpVmUOT3mQgnF/0MYU3Glv6lmf6Kge1RW7KPBpn1XaF4GBrxuXfc0XLCD1l+9Lfvw/2KUbwMOpbizunFpUb7KLL/3xRr83+MDdTYL/Ywf8K1TIkAj6abFC387PCRA0o0WHyGZP8Qsk5yRuWhTnqLlSw21H2s1z/nUzV4sjz2MRSpuvnZcL+wfbHqEJIB2DMsOqGcx/qyjpywDK3T2Kw8tKCG3DGjrm3Aw3CFvQ0klWSZPPlY2txvndXiIQW2mvaEQv5CtjjbC20BJ+gyHdmMDqHCYuK6jefVIdCVjk7ml6yeCghDM96y3vbRqZcITXLuh/+OLsz+Xh1MdJonCyZNW+CQJHwfqdWLjtbaANLXTy31RDG7v1AEqtXYznSjJUEJfGMkVex33tOvyb7fGAfdYCzDb07Hm2hqF83HC5UG5IMgRlckNxoIyzw5y0Q8leKr+K6AmX3QG8kjMg6Zf4mkcx1peWgpDrs33vAIpv5qXJJxe5YTMhevHd0+ljRm2m1eXgnb7TQIzsp7tJufzP5/5Uvu8tObcGQl8q+KSBfdssVtK596HbAMjsJ0L/RE87EojLSbksuglMNlvBVNYmgG3CP3DRl0HoR+QfXNFlLGKGFyLqcdouLg+i33vwXjx4hbo8D17kMiyIF0WP2hfAJTw8JZooF9cUBwqY4wTEzP+O3yEX3hzwQEA+nJXP8DqMO6zTgYapUVNlpTC7BlyUFwOQ6UGi9/WVFairLmvzZE+oGg4piopd2GoKcJjlsHopMJW+raiX4FysqouGZbOgDFNm/MYQovbFgdum+a+xSqPbPPsxrejarUxRAKZazzmxWOw2khodCd2m18AM2aIeJC8KVgEAQdSHUDF0OsNvV+4jyLJUiJDfkvZcOm7pHWA4RkGW2tcE5fQudOWDSo31hTOlqZpxnbXvbWYziG+yRQkv4qLRr1xNzmj9Lf26KcQVoVwHd6bXCTVzC+MsKHA03NDyvmIcKpfEYqJmoWUAf/5Qo3ivzLC0FnlOzVlx7DsyzlhKt4eYEXyo4i/tr6RjXB4piPlMgeP8TqslLKo5jG/EGI69QS2lY3V0fO2a9w8UeUv+L1Kj1BQ5B08Jv/iTJY0liDZiN2TuPY/6Q/wQw72hVfMB5MlSlfWsjf/9cWHRSBXEsGr1mxghmAXUGi6k8tzblFIUlrojsg+QAlXHTqVCMeuShPVLAugYVQQyVsAe8k6B80SCyEw950TzY5iLMrMaG+8ZgeLAmU4cSQL82GfiaImygrdSpNosJA/cEOoeO5BmzA/HOd2pUa4LvzAwdrGso3F7kl4dJo/enT+qlEVJOlB5XzR1pDSahFfovr/d3lPSTqHt8jntjXN+CwowUdJJ1Hx95FORx/qaNQzOrqu3jqlQDCQCOCGhF+eC2q/iRYjs4Lv5MKhaIFh7vhMtJ7xB6Itvzo58YVYEngehYwBDTdoVT0QUMe6SWd4oBKeXISGyvQT+rs2cBp6Rkpg0hPrkTtPqUCEcSbeMvc2TM/fLi4xfVipfBTI04kawHdS/EUle23rToUeSthHGLdiAvi5Tp70/U21imSuUzIiEhGWp24+W6hb+y+CgThtzzWYO0r6ZcQccYrg2LE/9QZnFFQSHfAcFk+i2cJ1tH0OaC3wPgTu/I1mVIiORADpsN05980RvmVN1JIODwjcmzCnTTnLtcSDcPz/GZE0PQUw5mx721dCaTxgmSw7Rfo98aj5p6Ufyql03gczqMWGcDJYqFw2fKkVu4dj9xvr7dFlVHZ/ZYnVkYBhj3SBrkhd21TN93GAwFavmHG69anOPWUyut1D+ye0nbct8psScMfXEGl0JTEF12BFZwyuS+6z4MKF44WHc5KIEaP5j6vo9MpDXYiv5BQrfnN96DB7SwH99F/wN4udqXcwd/Iat8CWO/XmvKLdxcOzsZRXvhSEBXUqM3JD6qkv9Lipnp/PqxThA4cQWxCKS9zQ4l8VU7uherWlc27in7x/sN/qa4d3l4IO+Sj5Vi1mS8mZUwJ+3B00bmeYRmEQ3PA7DwX9s5gOkRRz9BXOYQs5+dxP8M0UwYiQ2cNU+8GDLqVAFONsGdIhHWxr4cGDmXFWRCBrCxfS82kCR9qbwhJsnvC8ce0TmP7lToLwJHrPdUuRm7M1Uf2HMmUzFOrJqHCJuCtxWsjksQb65C7BM0a5ja0LUNLstuQ1J3Vr0JmiMjQWUpKuUSqmaVqhOvVixr30ofVgtiZgM0r80z+0AdVl7LU++AfOMyDB/xTm/cmPzerkAMUEAi5aS/iqVSfGhkCAFak5G4PbkI8nUxG5uhUNPPrZmGBn2WhM7d37ZfxcSU34jbuYM2gjo8VOhf1tK6XO1XKalBthSIvbeGPTxU4Hz/MM8HMO+SLjIjkfoMjYW26aSwWyImiKwtLQyN1/S1Mq1T+Zaipvstk1MmPBI1oP9+P25jM0ryrTn1VhXBbPomuyHJMswdUmui+qMhiLAxV6VvzK7j3itk3bn4a/jHuc3Ch9JKQRxn0pDqNp61VJpNJqEHH/4QOAMvYLONZ+2s71O3df4gEpni6AGeB6Xk9eh1UXKSIYBEbekhXPj2wULjLQUFOX/K2IEP/VmYDVxCNRmjzwK3Tv9tv9/Vuy0Al4Yw76BiHW8uxYDJmGG2jykA22YcZ4DzPRMHIElUWzjejSt/39pABuHOKOIOyglWH468EJopXDkEhRWD+AjUpjopiSWkDaGeFVAVrP+Ujsk5p5ISCq3CrbKFXbXLLqkw8F6cZ29/G6ZZflok/iOt9Hi9dt9Ogd0xvP3biR0nbGb1zuOp/6ITZ6VZHqM7BONMnmxeTgJITzl7HZudjgjjonrCng4GDa5+iQmQ16n8WIgTlbocWGQa4RngyzasqgnpADm512jHCdLqliaBMpuAPBXDu1fkexyJ3Cend/8fi0d9ohWtZP09Yv1ei5t976LZWRvh/j5aCNPbM/uehBFjLjNAO1thNUozjeLrh8pDu4Mq8UULmXDLzFEsXofPOfmohYEFKIUUe62r7qrtFpLJmKITV9TH9rHnca5mcR7wxe3HMY6YFh/Ui20BSZF10m0ls5cJs8mws9zlKCdFRErEEMHnVgm4NkzX6r03cBRk4qv0DKcHR0diC9GPb26aKmbf+Unf5t1jem9YWy05FQtFBqBYkxjYVvrbY/kc1sliSVR9x6gXdqZN8hG0oRNoQv/yc7f+I2DE6oJgaR+QouxJXmm8isq+v3Gl5nmzNRQWGKdre9eauQfxlbM1FKNF3mnnzSVT/Gc9CtvRO4D39sSWc6jBp5VQC4sdaF2TQvECUec5fF3ahdWBpfimeTCJnfaIC3EFsH5EGIVdhK/USPPDP/6z4dZVs7pTZM5EwYs+ZmrJPL1HSPkpq73YtseQ0Yzuwn2R/8FtbmyUqDFWfdZ8OTdTKZ83hLJzX+9f7ZQo5yb8+tlYipPIPc4idDqaDULUV3rAcQJpnBwWYtMQauMnbxHq8Yb+pGz38pLqa6tYTmLAqydP7N4oMu8dPI5ZPxxq+JnybdjLyNtj9wzF8Xchc3E4LZIm+SlIR7WhkDiqEPKl6xkRVwt+wq+IgnxSxeCTLVBUSrK8B7dJdy02fKtcUdnrbwLfGMlP6OwZ2Q5vmzCng/nUmuOuh8LQnpzk01+KnR+LuiIVu9W0aVWcWTnsMk9SbPl+paHTX2GQU/I1Z1WkkbeSD7PK6oAboiLO4MNKDKYJ2hbtke0PlaaKPha12Vwla11OhQGG1jZmfQDK0GfK1Z0hFydFiqsKRmRPq+VFslDAp+TMIsxUb5lTo/XxpBJAa78inYr4fL76F05RnV/gRCUsYimepeG+dwEC4bsEvXDhwIm5sKBx8v8wC2gO/iYHKC0Phhp3rCww1CN2OOwgz4UPBGUfmdm6FpudwhbKGxuSAdPpfvtjkv62NlukKZANxUspwh7txzz7eeWg+ZGFa/ZE8D4l1bgPj1PsYJjYR46AAu+e5jr9j9L11cV1haENHxYH7C1Z1CBIQxaX04J1ckh/4xiNhLSCs5NgTgXd9zA31+6hj9Hr2FD7gAM/e3go01ICetYtWb577caDoGtJhJetFCOuHXjp8hK0HL7MtD12e7/TIwlDLjqp+cD1njqlT3BQLTU9ZnUbNhzGX/cIAsWnMDrCYbQow5x9gZ6kXGaO9fQ5tFI7dixx9alwE8C6BC3NMrOPzaLne6TawO/h/iXLupwNIKyAXi4AdOu9M7YQxNNy8Zk+1UaFOaacsGtJg8P2rtji7drcXMfVWQ4qd0Vic/mAXl7vuPqbc8LfiVEWRSWX+ePg7l9Z6nFWhMJjK2qp9BUSXeU9vZ2bjSco4rX/FbRf2fCtryGZAbaNlc9zKvRWN2fXafc7rpz0BYZ0viqLDCnEvnVgpeyMD93NHorqu3UlpXZ7zUQcNkj/iyD5Bc+RqMsbyBnCswvwY+UlJqMHH97dwjiAJVgiD3S4KYxEbN8UuJJ9XMGRM0rKL4zk4hE5A18MAZ+DHlhiOjw1dPySsT3/A9VPcyDeGcTUhqPUxjU/82K/yTOae3rsxYjKiB8EIofMKFuoc4njce86+6fFZnykfiInj1/jFSQASIxBeterzEr1CVP2Gph/deqF6HdOx+pExc7f3fFYT51xsZ3kri8YGgsZ0i76EVO8W2PMlRGGGdAuH3W89jFBZzO/9b2BwOe1rdQNmWmVBkrBAs99H2Hw7Vt9nfNIG/fTZig4G2kS8WqULAb2uZ6SNqoxxVwPk1XyVLmYhGinnPA1R4uP4/8c60DBqaA796uDtWMCEquXcPjnEkQ9687zOjdpIikxfzJlFW/FvP7jPNGBCaukeZLd4D+NdaSAKJsQHx+nREAyHp3DoladmItXvaGn3x9uJV9ZHe3MRwaNc70ZpRKrYmVDijNpnHJK2U5obobHcF14eCTEhVISygWFdc5URRv+4EK9pYtIsItOOaQ5D+AAjaHYmPkxZ8YggzmB85xmUGPQg9+7YjnQeU75LSLenLgRtYSWq9C/8Z69PR1HZqK69s8kxGsdNBnTFAjGXxHEH51+ydL9oIFHBXOCc8n2W2UOos26ssrjRxlazhaIdcKSWRXaPRpagjXFg7QXn3LO3OVsHbUJ+Kik7oiINU3V8/muNL/g9kBpfIm5OAjl7IZUDtaggnYDrYJnp1orL3YtjkyERRw9URgs5ivUM8kcwyzJu+nv3VINFUWRHJP23K9Zo6RxRj/47f1xKONvp6aH+HwGuXdSf7oBHZwwDolRP1SN1Kwgu2bn0+o1TmCwEAXf9Hhs7kaxMh8Nna7Oc44BLhc7/j+95jScI9h/EMvmozlbnd5xgtns9Nxh6lOO6+M3+EKgjbdIMRgRtk1N7+u9X4ulur3/el8dlpjNGuk8SmL7tiUqkktJeIRK3K3mbqrJabDnos11DaYYDMEps2R//cF/0PJDzSApU3Y2P6IHokHkt3SLnyLv8Skinvde4Fg7EpCSP6M5fMXV0/I9YcuX1tdOcXou4mkVnns2ddL++Oj1ka0pne0g4qvJfhWBpaHKPGBHJsLoDtJ9q67Mql3kduRvypY2E7xbmcgyp0T5a3sVVn6CCTTZnD3aHSuyV4/Not0D8v5OR+58Gs4DiN7nb0cC82vG9B5lip9ZL0FrQdoVtaBT9+vl18fsy9kyyxjssvBNI+OAuTxakHjx5Pnt4nHkTsxNpBI29flhpmZ5iVjoG/6GFWquEsXj3TynF28bbSxTo5Rj7FubCHuVSAIMN3eqyNRkDc3D3/fTOyC/C/wxqLPx72pOWem8b2jOcahHYG87t/lA5gFMJaIlAlxlsJ027HadmBc3ZoYMzroIENj84Xt8QaRTuC4xZES48v+96fB/O7QmrU/rA70dn8fU/Hbo1onhJWNbNX9zTboTiib5GfvCVSI6KpMrj9r8FiYo7piwZVDeDfDBOPY2PITTkJVq7j5Tkzynj1rOxCyMnwS8OV2/rX3XRFtvPPVlfgq9BYDSDBaq+7i3FxHFY6FjnScJkdJS/5bvjkidwfJTdOgq61+Mq3RtUIQGhmUnf5dXP1EeBjypO3IS7eFyevOgEJAkj1asiy/s1z79eo0ob/WER9qmbYXm8DA5QyG9qC9sXe1jpyl8XjFeWBfM1LYuLPNZaoyDRtkxCJJsiPy7SQWw2raGmEkjwgbvdG2Qk1LUPDDyGt2hICYVyqLYQXDOX0O1oNN5hmZ763H+9dCRqTfxYjTtLc3V9rz1RtqiVf5iNE/EXei8H+evt1k1cnB3LLl56WC2We7XbFk/cqnf5JD8C5UOvJgafKXO79KcPmFKYRQNxqcisE8bE83J4Adqcz3ydPd5DL/MM0lXBz+04Y0YZuct0yYdyOGsT9xQoRucLT07w0Dvo1OXf5U2J6rKJumgtMvGkd6EKZSNWVjuhdw1+cf/+HKQFP8uYropxI0qghcg5ouJ0hRGyTiKkI8gGZyJgo6L1YWroIDWLf/EtwSCH/4x29EgbEqmCNthI4idYCc1sZ425mKfPL/qjrkWpGFW+yl3USO1QVsAxRE2CuTSSF7ss5iKrs/ch2zmQpoylBhTflhVSKOkQha64wvDkfrzLCyZQkUisKeZEoBhS93eMDM8PEe+N75En5OoSQz3SiA61JWYyRb/y+Dcf2lXIjna83Yy/SePHjy1kgock08hAfIjBiHhOBZTm/nkVhASwrEuIUhBMyesBuBCpF0CHqyxgB29SL1wYGYTg75JcmG1rZkBZ6bebzo9Dv/VaBX4jmSyciTki6Y0+305X3YiXfbyi9+VsHezkxILUILUEOdsYlfS8lnAXt7ccCZebyEfHbXb8SrqmTAtrKxaKFFsgR6/b2xiEDZBUtvmjY77h+vHEi1p1pfqSeDOXN3ReB3fUHBGJCDpPENkKi8wSh0BHhM2qWd+OC9Vv0XnBFTQ9NuXTBJPL+3DptwB2BXlJJUU07PKKoM0KPjypfIs9LEbznElYstvlpOwkVOyKMPyxZHZBInsqzBeVLrQEUultQN4wjI6WnoBEftldLgcWvQUTS9aNEYBWXZY5nf3mizwwqZ2DaQ7V2TvL2Avf1G1pFtLmocvsCo7bb851dNXNPxKcaBPJECvuVjUdITSyCoY4y8nP93MtS6Tqg9Db0rFSzhYkI3tqJ31Bd4TKacwvR/GTkERf8cno1mc/DaEeGF6btf+o9fcuVGFYORZ3fGSC1lb9+NfN1ILJVSvTJhEeocPbIrtiQu3F8fh03uOazBmy3ukoyTjjzD0Gt34Fr1C9GIGzlw3ZAVjyARlVQ9ww9idPUtzHiMEmXQ2j+JoPxLMxcL6iahjQR0Cjg8GxF0qwAS+dRStRX6nYy5FHn6s4GuavmKGnGykZeHfN+XG2pOiQWpcpP1NPu6XCsN/t73qBJ70zS1G29Uh/hYB4eOs5oQyRQSKZfLdt3YTjI1X7nBWf0ukFlISND8xNGMc0Qkp698o0H1VcLB9ehHv4Nu/Me22LD+oiMSDJP0hg/oQ1Xt6VbtyFmI6z2UaeET6inSf9x4RARR5iFsVIyh193lbd/cIP8nju/jhQ81P010MUSSRw7bJOwh/nj19QaNgii5/N4rhyuQaG6MIJktO13CE/fAMFB4Y3ISvpTKi9t7MXjT0t/mU0J3SfgblfBXOv87kI2ifM2lB+Oy8sGA5ucaZj5a2XWT5KKSqh8i3GJ9XAHMad4vuAGd/geEbIoUc6/WQkcfWBrHURH/aILQy+pzxpA0sD6heuHuSXAUOrHl7YzWqixzDXlN8m30DhlKYKpYGJdPVC3iVaXzDy6I7riLgwj9aCBs9o0CMrrwj9itRjcaLt5+1TIli6FYVKYAf/Gm+U0sCs/zl1Qi+SyQuWTlqmx8adrZulZqQQ7SxqbnlKMN/HaN6RagNQYt9YfjH/nRT6dv2bcXnkMVlNhB1AVSUeGQvbzy/5ZSpdv3tLvya3CR5t+IF5fGY3yA7DWOEYZZWgaeHJqfUXlP9cfpmucEEkzEi3z5hyo243845uPherUjEs/Bog6PmpH7lxwwhc2fOTfgwUIiEsASv07vUj5gwc8UGc/D31UEjanQZh5/4GSYhVf7thchEz5yoXxmt9b8ZHHCDnYpl4XcN3cFSlRXx2mbtE08RqQVWpDpINWjS/fxMqT+xnQlh30jyGLh7oOHhWvRQyuC0oRerI6RZuU23VbuDSe8gTH+VErw8d1QcMo3sG03GNzWpQleibkMDagwu9OfkSQ783xh4QSvrSCanVwRfUzcVZh+mJ8WaOgd34B71ecEE47mpOLDhxwp+2v7yFsrLSbqcYZDt0VeavwkBddwPFZDhL3uMM9o7wFLa0+oCgpQktXoqgYmDj4pMnqG921Xcg5o3WfkArf5SS1YjT+nFtCDZBVyf6ssTp61UsMK1nQDdE0CdPKBfVXw1xM+AYV0/Mz9+/1oR2j5vbg/LnAi1ygw5R1rNizZOIxJHLTyd8FuA4ZH4SYE/9986evzg6JtXkWi08Gvz8IZ/tpxdU5EmNYmMc3M1W9sJEtwNSTACmF3KXNyug5gCLQNJLmbLCJrewO0Rf6KwR1rn3RowWPDkoMJ9XfoWSLc5eIOZivW0PBuRXIugKVaBEVpj5KatAhdImWv1sP37je3iy/rjJ/bDEqRTZ1wAXVUsKgbY9UkNghK1DM3p9Bjl/eTPysUNp2Oz6PKXX1nMwsMxAZRAb0ajw8uR9Lg385BY26WAtV8SGmd7PlKB93eUz0VU3Ws2RffkPfBCcvx8tG022oqcaqvBVdbjl1itR8WOsh4mHXxGIoCSAirF3SVWxsHAYekQjUjntGjdmowwzTP/L0nQxBCmmN6YOa2EKq+j+c5jnWcdqQhQ1IxDAwPI7dBMtoQ3PMUJITXZGmIUwNEu5+rnnVcsSUQb4mD26IYqF8ZvVLLy286OxTaRZA3hwWfu7X8PrqWBBTI8nbFFOwztA/+++G82iVrde1+HYsp5OtGBJr5wygPjfxXQRrwQv+jdg43y7zA/j3JpWLTiOGnvUQO6YJ0C62FLB4kLrr6ASmD3caZFiqxypMl2jXRaHWb9PklR9M9u1ZXnrgUDMPy/AizLTjL6hlj+w4ksfFE04DJ8FTKTM2fWuTauJrL2muJWTLwrznv8wSQkuGuHxAMFSwNs90v7frduojBhLl8Z5PR+ME2zjY62u3+fF3MgghqwlLy8s5o+JgF0juAyo4EgqqTHPQJwj2sm2QGnZFjHdIe8R6EiQVjCT1jPRvilABG+f27zN+n7/TJ/djbXNa1z5qdv2AjjXT1D11ocd0Bpe0mzpwdCVVn9VlD5WiI4h0B6mSXlX9yYifsbMOR4z+8IKs2UeY/G+80da8GjV7sa/67BnxDb7UovaWWjb/0YOYvmRoAuk/s7V7MMwVx6QjPUJyPLKIq1Wei78p7jNqF/nJecUyrWUNVu2vG+enlBwT7DoaLyteb3WDG0e0BRlHKUrNyrvQjLZr9WfdXdJ787PQHx4RwyXfb0avttgt9JYNa+C1ZP4N/osFNujJJFBL4/7MNe6AS67Udp/Qax5D0wX4+WF7XRHmB5PvDCOa+Cely5X1Mk/D+b4MpeU8ymsciCNwMFoXAtoGEZpS/v4CUfEF25reZGDc2C14LjfWrX4yVie8ZLicXBZgub0lgsFJB0gw8nFdNVeygmGONgluLfBFyiEbtbCRmkTjqoIcsWVvi/MBu7QtPpkcKYICRw0IXnITTM83vRPiUZEFo/EkyyLB2N80SVoFpVtPOg8N015egSdqXeF43+8o9JmP/z/Ey+vuVNSkakbHSAu3/vfX7wEtOwDpet5TaSA1GYz+53oRS0rL7lGds4iKJz9ub0/Wr1lq6I0w3qiuBauwQ3PVA7MazPOT3MGNDkfHoGcVj9o0ABmrL31n8Gnin96JGCPtcEO94oZ+7g96tZ56yuI+i+f7cXDR8VwJXnU3m75GwvCuu24xaODPqpbf9CDguqEU25B063hy5TTJO3ZKOfAOFSkiXVjaOf4uwigc2OyXtnapEsAMgR0FHZMj9xDx8nbdIiVfdOH3aOPwZo85VMJZOZxAxPU3IwQ/ckzC+Zwj5TEtg/71ESP/u546CfNI5/QnLYlt/FVE9756BchwTc+hXSmpYpxsydKiSEStlwuZ+nj3T2p8AE7gewP4seRWXKGyaX+sD/oeoCi0H2dNUcpEwAU3wj3vi0vJvmZwcuY87n23oQcsfGBuf3xWoKcXD56T/UC/yZlaKAWupeCdKGGAd4iNCTF2hVfgqwn1/lzanIxkblz8OwJdJ/RrZmgVAnrDDHIFe44U/4Ws2YN36JXYXcC++ZzwDc8qq6YkDXw1LQsZ+SfYvyiH3jFLNpnCKsL1AVOcCKuNgUbT8WBjcdk03tVYsId0dqSRGXMfoeUoYbNaOTtqlstUNozwxN3aDNj0wd/X5L1Gx5LKpZUMuyeY/xEXs5poFm/RcPaB1RCkoUVbdP5TKvdcz3Ng7ycFawqKPy7s/N66YymjlujGHP4gAeCqjlqTtbY6FLddMbnm1dnVLJXZ+jrtCioAPId/xa2XBIHicyT97xv19s2nReQAc3f4PlBvZNedBnG4974LyoB9DMsaRB3Zb+2ZEOZ2mOF4t+IRDTNX3Z8kbn7HkRhLmXtugmbxAxNPf80JCfFKfwSX0IFgFbhtkoOn4YCt5HuQ+hfxq+fZufHwXk+SXFGzFcK1PgbO9r+gFCuuMSWSLvtLQmBQ0LM60DEWqF3E45vTVs+yeaygwYuDBdi6nrrMDRQwN99x0EEGDQbu0SxYkYpG3xqrV2PKuCAwsOpfr1/ZeJYcVayX6Mu75dX8vG28Vy5v6cG9B0o0X+2cWafvN+zvxggrtIYJgEryvfCxTp3M8IZ2JmCbykrtb7EDP4JaggZWoJZMX8iHhzphY2JlA0KM7y+b5fQAttmo9CjOetE+cx+jW9/0MEf6Xi/abZgI3dMNJBmtwg/dYZ4017GirDAeRYrxTU4nE3wv+lG1PEhzAfpCyjQ0tacfhzTSfyRj3y6Y9oUsL6+7e1MjXnVl85aYY1mKtIsLA3QcyNP8QNpgcdq+ouHTTFmRhH5ZH0ixbuk8DUVniD9XmX9FHxPHOwZPNOntUW1m/FQgsQ5fyrwtETjxDhhmI19+kWakvWOnmvHF9FNDnI5pmtXpNFL/r1N9/NN+b3CUMv0x17JoMEY6d3VJSdj8mQE/rd4TbBkEf7WRJbbtFwC0uVC5RyaK4ugT7clMia8a4HhEyiQ1s4A6AD0pAEdUfi3C5Ie3oDOSpR/SSohA8Na0rdwDCCv60KTHNB9sqHH3dqn1MDKltYLRJoUxH4CZCATAZI9FRwXsqCT+J3ziPjZO2CDgyXpB/+ID7eBcgtiDW6/JaqppbWNuWpM3vxqdFTy6T1RkBVTD4J6GG/Ou7I5+IVI28iJf3LXJvXGKBcZjPqC7C80SVRv5CAeOvvaVXzI44+tv6p0AN35jDE7hnGuV3pccQhj1S4/uYMpbNq4fdpjsk8T9NN6r1fGqSO7MP58HsmaHBBhc9mmFhaiFFtmZ+AounTCNpDHPVxKpaGt+XyIBODuiIbVCzctp7dFApiiKL8YHZ0Fscvd5H47DWZjKtWbCY41/2/Un4A3zRdOoj72kVap5CcJV2ufNN7d4LAq7WBwfeZFL3ThwIeGMVQl+bBHW9zNbC+w9yibbMURxewdLtMWCLrpnBEOhkUgVd+gpE5NnpWF7uU/Ps9wpJ0Y5r4scMHK4bAV4pCkscd5lpq84n3k7dI6OcsSQBKsOWyDK3JsMR8R3rg+iAU7llO5byHTf8pt048jNv5sDXeADrHX2M7l+JGMr40OhO0o1etcEXQ9Lm3SgNdDQ5+nt6t7V00LH1fNpvYXZy1yaZuNC/0uZQTA9fCv7udmR0EXVtsplICilsrad7aw7qofQw30oVKUeXY9D+/DTZrO+ufPvRELotQvwQe07NbTbLGZkPbUjEA7VG6lA5rVdReCIQzy+C8rjHXWs30leEGu+aKUFgQbZGpnB29C/bYKte5EhEQjSF4xif5aamMaYG+3l2Y5PYngPG+NUF2G78BOIAolAVNenWbOYIiJ3EI2GD2CDaql36Monjsk4bXtR90ur6QHfy4EqNdaMyNDNM9g+L99MKMZx00uYdxib1DFNzWxdYnzIBz4iIrkbuP7iRMVn8mIAIRaSBWbIsbd9BJVIcbXGYyl5uXYkta7q0HSNfkl901QimzH++4Ys2ZICsc0QWqaOlhnunTAx4dAtaThBZRDjoJokNvbBlGbgG+l1kM4lSpb5h49G31ND38Y21THnn+M7t3vZqVnFRRmnCainjmikgPbMrvuCsswR6K2yafIIt6JtcFqgf6kCjdYqYt36AO34gPxLuiXqcPp+reYJp8mTQXM2JP3ekM6qj1qasvHNw7AbdyqUSEjZ9yPRKi38xR7KxbP5SkxtFQqz07e2E6FJhX43d3hB8QxYz6HCvIsLDfhDsjqBUrA6sBse6G/Zkgbq5dpwOPOkd4MvifeKKTUZm2FayXeqn8PRcFww4azGVmrRQ3olo6wXGVaF8CAeoAKvAWle2+lYCV1/ppUFjcgYnHmDRYg9MMhsbXjg/kxiCHiu4JH9Kspe4mnoF5+vmVHcXqHSdEHEai/j4K5WDgG/uzcy5LWRBJi2GeG6U0L13AFE4Hc6j7oyOVo58MhTfhAfb8fS9ewRYA2shVnYYQWs4zG6B7u+Si0D13rnkhBX4BcTnH0Paoy1TtjYcqiU3IV2Vqi68MY9hddfHKJ155HgbJ0bS6OWbA4fwo5z5Bd9RTqH6HBNiIv6bcGJoX4rjDxwc//fLCwputLDQsJN54KxzZc/cn+KeQ4mJto9lUQFxJzWy388YP1SmcjGRFaboHwSC18oFk5zBchhpkKRVARWm2b9KfCaa1bJt7JwMEm4YArsD/j5LF6LFFIntrB7hlTUAtdHk9KSH7depA1jN3JF+CGawd35+INP19vxwu+5Mn6OhJrlhnxYJ/0azOCOkmoUt+0KEMANGek70mNNev6abH+VdEmjxTRUSeRwoSqmfy6bqsxYSPL/j9WZ8X7c+4lKTvwCYggRr5gAqcr7YLottWqW0NJVSYjuoAGxA+5Zx/83uetBWQnxGRtXlXyARtTljmHSJo93CI/FUhfSpAv2qKy4M99N6nk1E4JfubyTb59RZC4QvT31RDqvrQVBQJj/y9/+wpaUCbXpIxKz56IjrijasSoicCJINhcxdmIpfARtwoaiIQGCC0Zmc0G1iZ3De7JxbPMpBrlmrVmykjhilfB07DEuagYk3AQ4/w/tkBbS/Kp6oXyjVBwXt3T+MLKfeJnQ3QeHhCX0uZ/zDflefXkpP1AyJBhUnEewQpdY6UeZ6hdB0meJscSjZhsrRDP6+iit9wl4EyAI7ojFH+V204wv434Ma2yGwF06Gc+wIGR6on0OQYIRIFecCoalBPq6B3l6CAW2Wbx+Qc6QWObDzysTP04i3QJYgqNf3U4sS91NvJEQK7l9Ypm+RIPe/eSzj4UZXBGyrx9SMnPOsP3uiBMRUHNnCCwAy3AJT3VzMS61PngKdPbU0WzoH5ti/Uy7vcEDvW3PVh798wlYDayPxWeEpDmXXFDTajaOFgGi8iAdq6GcDc4ZpXgSPprhEMO1TsKfvQpealnT44qMQBirvJiUTrkpySXvoNG/kwrf9uSaQwosn8dZ+Ght/oD99SnbOUN8DT/h3FkJk4Uwy6kjX6NSZCK1AAA4rPJ3/fvxtLOqgkMRds+/sQKFzwuGghX0xiSuCXIyolm6ouRzuJsZYk9m6CIjyDTOemt3g8xnhuC713VTZzj1SJh5nc9l1lqjgj1AX7E8LWq6IfKVGcX2/ctaV5DRhiv18XyKKIbnwP27eQY+h06SR9EBNHVfANjmoa5Kmlko1bt8IyNKWGOAfClHh8/I9yv/WbqGwvs+sxw8OjzK+ni2kHUzcgq/BkMvfYfUvFvq8I+05/ZT+qK/3elxpCr5OfJjHVs9KcUKy76K7u2Axolx3cE1A/unINK0+pbhZbQTPnVWzdVXT7shWKqW+Dru9sqUIpDYg7cr4q0Y2wyxnhF0bKtTqCZieT5swUV9bgIYIgUyftaWJ6Rttbdl/a6/lg+OujML2BU6vk671SJy0WjpGOktv3blkWfdWUTADXvmzk1zTOdw8kWRTAisHYZV5z9KEcFagopXVhqRsgptbwSnOhYz9q0lHJ1x63YMzjJTyAbAayoDXswGgC/r8cLv4pOUd47OZx214gssJYTPY2x/7XV7ANa7rlVAgQAAAAAA	PT Karya Putri Cikal	TreetMi.id- Platform Dukungan Kreator Terbesar di Indonesia	Beri dukungan langsung berupa donasi, mabar, dan jasa murni kepada streamer, game developer, dan designer favoritmu dengan fee potongan terendah.	donasi, creator platform, streamer, game developer, coder, designer, treetmi, mabar	5.00	8.00	AHU-A089891.AH.01.30.Tahun 2026		MIDTRANS	t					2026-05-19 08:16:03.181	2026-05-19 13:20:51.871	1905260078829				
\.


--
-- Data for Name: support_tickets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.support_tickets (id, streamer_id, category, subject, description, status, admin_reply, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transactions (id, reference_id, streamer_id, sender_name, sender_email, original_amount, currency_code, gross_amount, platform_fee, net_amount, type, status, message, mediashare_url, "createdAt", "updatedAt") FROM stdin;
890fc248-58a2-4e06-b2ca-48353a48c6df	TRX-SIM-051185	ac77b60f-827e-48ab-81e2-266149e36f3e	Andietz	\N	10000.00	IDR	10000.00	800.00	9200.00	MABAR	SUCCESS	[IGN: Andietz] [ID: 123467894 (2082)]	\N	2026-05-19 13:40:51.192	2026-05-19 13:40:51.192
ad37929d-43f5-45f7-8665-12fcbb8f414a	TRX-SIM-436326	ac77b60f-827e-48ab-81e2-266149e36f3e	Andietz	andietz.orion@gmail.com	20000.00	IDR	20000.00	1000.00	19000.00	DONATION	SUCCESS	Donate buat CPW	\N	2026-05-19 13:47:16.33	2026-05-19 13:47:16.33
2bd5d8cc-573a-48bb-9f10-0f315813eb36	TRX-SIM-520007	ac77b60f-827e-48ab-81e2-266149e36f3e	Andietz	andietz.orion@gmail.com	25000.00	IDR	25000.00	1250.00	23750.00	DONATION	SUCCESS	Halo halo 	https://www.youtube.com/shorts/-hMJ2R5MDhU	2026-05-19 13:48:40.01	2026-05-19 13:48:40.01
\.


--
-- Data for Name: trust_badges; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trust_badges (id, name, min_supporters, badge_url, bg_class, glow_class, icon_class, "createdAt", "updatedAt") FROM stdin;
5ec28ffb-c8ca-4a78-9fa5-8b7d6b564ee5	Rising Star	10	https://cdn-storage.treetmi.id/badges/badge-rising-star-1779187942469.png	bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-200		h-3.5 w-3.5 object-cover rounded-sm	2026-05-19 10:52:22.827	2026-05-19 10:52:22.827
fd654b38-1af7-48f2-adc3-f63929496577	Trusted Creator	20	https://cdn-storage.treetmi.id/badges/badge-trusted-creator-1779187967279.png	bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-200		h-3.5 w-3.5 object-cover rounded-sm	2026-05-19 10:52:47.67	2026-05-19 10:52:47.67
7cdd60b7-b53b-4e78-9ba1-720b43f7344d	Super Creator	50	https://cdn-storage.treetmi.id/badges/badge-super-creator-1779187986271.png	bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-200		h-3.5 w-3.5 object-cover rounded-sm	2026-05-19 10:53:06.505	2026-05-19 10:53:06.505
d656b719-fb93-4ba4-a0fc-68a45f38d279	Ultimate Legend	100	https://cdn-storage.treetmi.id/badges/badge-ultimate-legend-1779187999761.png	bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-200		h-3.5 w-3.5 object-cover rounded-sm	2026-05-19 10:53:19.958	2026-05-19 10:54:28.211
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, email_verified, otp_code, otp_expires, balance, widget_token, avatar_url, banner_url, bio, youtube_url, discord_url, facebook_url, twitch_url, tiktok_url, instagram_url, website_url, is_live, role_title, is_verified, status, verification_status, verification_token, verification_submitted_at, target_title, target_amount, show_target, show_queue, show_reviews, show_calendar, show_services, service_btn_title, service_btn_subtitle, support_btn_title, support_btn_subtitle, mabar_promo_buy, mabar_promo_get, "createdAt", "updatedAt", schedule_title, verification_message, verification_platform, verification_reject_reason, verification_screenshot_url) FROM stdin;
ac77b60f-827e-48ab-81e2-266149e36f3e	nodesapi	nodesapi@gmail.com	t	\N	\N	51950.00	ccc7ac8e-4574-4bbc-9067-d37827003a13	https://cdn-storage.treetmi.id/avatars/avatar-5-1779186274787.svg	\N	\N	https://www.youtube.com/@Andietz_Orion	\N	\N	\N	\N	\N	\N	t	STREAMER & KREATOR	t	ACTIVE	VERIFIED	TREETMI-VERIFY-1UKY	2026-05-19 14:25:57.339	Monitor 34 inch 4K	12000000.00	t	t	t	f	t	AJAK MAIN BARENG	(JASA MABAR)	KIRIM DUKUNGAN	(DONASI)	4	1	2026-05-19 09:20:41.594	2026-05-19 21:53:06.44	Jadwal Live Streaming	\N	YOUTUBE	\N	https://cdn-storage.treetmi.id/verifications/verify-ac77b60f-1779200756480.jpg
\.


--
-- Data for Name: widget_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.widget_settings (id, streamer_id, color_donation, color_mabar, tts_enabled, tts_speed, tts_pitch, alert_duration_sec, sound_tiers, coin_sound_key, coin_sound_url, mediashare_enabled, mediashare_min_donation, show_queue_ticker, show_donors_overlay, show_target_overlay, "createdAt", "updatedAt") FROM stdin;
43a029dc-69c5-4212-8c14-026ebb6479cf	ac77b60f-827e-48ab-81e2-266149e36f3e	#FFD551	#34d399	t	1	1.1	5	[{"max": 25000, "min": 0, "prefix": "", "sound_key": "coin"}, {"max": 100000, "min": 25000, "prefix": "Wow", "sound_key": "bell"}, {"max": 1000000, "min": 100000, "prefix": "Mantap Bro", "sound_key": "fanfare"}, {"max": null, "min": 1000000, "prefix": "Gile Bro", "sound_key": "epic"}]	coin	\N	t	15000.00	t	t	t	2026-05-19 13:41:20.514	2026-05-19 13:41:20.514
\.


--
-- Data for Name: withdrawals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.withdrawals (id, streamer_id, amount_requested, disbursement_fee, status, reference_id, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: avatars avatars_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.avatars
    ADD CONSTRAINT avatars_pkey PRIMARY KEY (id);


--
-- Name: bank_accounts bank_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_accounts
    ADD CONSTRAINT bank_accounts_pkey PRIMARY KEY (id);


--
-- Name: creator_media_settings creator_media_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.creator_media_settings
    ADD CONSTRAINT creator_media_settings_pkey PRIMARY KEY (id);


--
-- Name: donation_media donation_media_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.donation_media
    ADD CONSTRAINT donation_media_pkey PRIMARY KEY (id);


--
-- Name: game_packages game_packages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.game_packages
    ADD CONSTRAINT game_packages_pkey PRIMARY KEY (id);


--
-- Name: live_schedules live_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.live_schedules
    ADD CONSTRAINT live_schedules_pkey PRIMARY KEY (id);


--
-- Name: mabar_queues mabar_queues_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mabar_queues
    ADD CONSTRAINT mabar_queues_pkey PRIMARY KEY (id);


--
-- Name: partners partners_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.partners
    ADD CONSTRAINT partners_pkey PRIMARY KEY (id);


--
-- Name: payment_channels payment_channels_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_channels
    ADD CONSTRAINT payment_channels_pkey PRIMARY KEY (id);


--
-- Name: project_assets project_assets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_assets
    ADD CONSTRAINT project_assets_pkey PRIMARY KEY (id);


--
-- Name: site_settings site_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_pkey PRIMARY KEY (id);


--
-- Name: support_tickets support_tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: trust_badges trust_badges_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trust_badges
    ADD CONSTRAINT trust_badges_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: widget_settings widget_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.widget_settings
    ADD CONSTRAINT widget_settings_pkey PRIMARY KEY (id);


--
-- Name: withdrawals withdrawals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawals_pkey PRIMARY KEY (id);


--
-- Name: bank_accounts_streamer_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX bank_accounts_streamer_id_key ON public.bank_accounts USING btree (streamer_id);


--
-- Name: creator_media_settings_streamer_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX creator_media_settings_streamer_id_key ON public.creator_media_settings USING btree (streamer_id);


--
-- Name: donation_media_transaction_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX donation_media_transaction_id_key ON public.donation_media USING btree (transaction_id);


--
-- Name: mabar_queues_transaction_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX mabar_queues_transaction_id_key ON public.mabar_queues USING btree (transaction_id);


--
-- Name: payment_channels_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX payment_channels_code_key ON public.payment_channels USING btree (code);


--
-- Name: transactions_reference_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX transactions_reference_id_key ON public.transactions USING btree (reference_id);


--
-- Name: trust_badges_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX trust_badges_name_key ON public.trust_badges USING btree (name);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_username_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_username_key ON public.users USING btree (username);


--
-- Name: users_widget_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_widget_token_key ON public.users USING btree (widget_token);


--
-- Name: widget_settings_streamer_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX widget_settings_streamer_id_key ON public.widget_settings USING btree (streamer_id);


--
-- Name: withdrawals_reference_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX withdrawals_reference_id_key ON public.withdrawals USING btree (reference_id);


--
-- Name: bank_accounts bank_accounts_streamer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_accounts
    ADD CONSTRAINT bank_accounts_streamer_id_fkey FOREIGN KEY (streamer_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: creator_media_settings creator_media_settings_streamer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.creator_media_settings
    ADD CONSTRAINT creator_media_settings_streamer_id_fkey FOREIGN KEY (streamer_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: donation_media donation_media_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.donation_media
    ADD CONSTRAINT donation_media_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: game_packages game_packages_streamer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.game_packages
    ADD CONSTRAINT game_packages_streamer_id_fkey FOREIGN KEY (streamer_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: live_schedules live_schedules_streamer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.live_schedules
    ADD CONSTRAINT live_schedules_streamer_id_fkey FOREIGN KEY (streamer_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: mabar_queues mabar_queues_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mabar_queues
    ADD CONSTRAINT mabar_queues_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.game_packages(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: mabar_queues mabar_queues_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mabar_queues
    ADD CONSTRAINT mabar_queues_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: project_assets project_assets_streamer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_assets
    ADD CONSTRAINT project_assets_streamer_id_fkey FOREIGN KEY (streamer_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: support_tickets support_tickets_streamer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_streamer_id_fkey FOREIGN KEY (streamer_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_streamer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_streamer_id_fkey FOREIGN KEY (streamer_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: widget_settings widget_settings_streamer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.widget_settings
    ADD CONSTRAINT widget_settings_streamer_id_fkey FOREIGN KEY (streamer_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: withdrawals withdrawals_streamer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawals_streamer_id_fkey FOREIGN KEY (streamer_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict eVSsAY4HTiXXuEHtyXCYG6KzAO3tZvAIo98fVAba08q0q4CTBUlmG6mwE3AX0nj

