(() => {
const categories = [
['About Buzz',[
['What is Buzz?','Buzz is a connected digital platform spanning communication, social discovery, marketplace access, payments, delivery and safety-related experiences. Some services are still being built or connected.'],
['What can I do with Buzz?','The intended experience includes private conversations, communities and Updates, Marketplace discovery, Buzz Pro for professional users, and connected payment, delivery and safety services as they become available.'],
['Is Buzz only a messaging app?','No. Messaging is one part of Buzz. The wider product direction includes discovery, commerce, professional tools, payments, delivery and safety.'],
['Who can use Buzz?','The intended audience includes everyday users, sellers, businesses, lawyers and other professionals. Eligibility and registration requirements will be confirmed in the official onboarding flow.'],
['Is Buzz available in my country?','The supplied materials do not establish a confirmed country-by-country launch list. Please check official Buzz announcements for availability.'],
['How do I join the waitlist?','Use the waitlist page when the registration service is connected. The current website form is a front-end preview and does not transmit registrations.'],
['Is Buzz available on iOS and Android?','The app source uses Expo and includes iOS and Android targets. Official store publication and download links were not supplied, so public store availability is not confirmed.']
]],
['Getting started and accounts',[
['How do I create a Buzz account?','Registration screens exist in the supplied app source, but production authentication and account creation are not connected in that source snapshot. Follow official launch instructions when available.'],
['What information is required to register?','The approved registration requirements have not been supplied. We will not guess which personal details are required.'],
['What is a Buzz ID?','Buzz ID is part of the intended identity and contact-exchange experience. Its exact format, lookup rules and public availability need confirmation.'],
['Can I use Buzz without sharing my phone number with other users?','BuzzDrop is intended to support nearby identity exchange without requiring phone-number sharing. The exact privacy mechanics and controls are not complete or verified in the supplied app build.'],
['Can I change my profile information?','Profile editing screens exist in the app and currently save profile information on the device. Server-backed account synchronisation is not established.'],
['Can I control profile-picture visibility?','Profile and privacy settings are present, but the exact visibility controls and their server-side enforcement need verification.'],
['How do I recover account access?','A production account-recovery service was not found in the supplied source. Do not rely on the local profile screen for account recovery.']
]],
['Messaging and connections',[
['How do I start a private chat?','The app includes a new-chat flow and conversation screens. Connected user discovery and cross-device delivery require the messaging backend, which was not found in the supplied source.'],
['Can I send photos, videos and voice notes?','Image and media interfaces exist. Voice recording components are present, but supporting voice modules are missing from the supplied archive. Feature availability must be confirmed in a complete app build.'],
['How do groups work?','Group and community-related screens exist. Membership, invitations, message synchronisation and moderation behaviour need backend verification.'],
['How do I find people I know?','Contact and discovery interfaces exist, but the complete server-backed people search and matching behaviour was not established.'],
['What is QR contact exchange?','A QR scan screen exists. The source includes a TODO for looking up the scanned Buzz ID or profile, so the full exchange flow is not complete.'],
['What is BuzzDrop?','BuzzDrop is intended to help nearby Buzz users exchange identities without requiring personal phone-number sharing. Its operational discovery and consent flow are not connected in the supplied app.'],
['How does nearby BuzzDrop discovery work?','The intended experience is proximity-based discovery. Exact range, location permissions, visibility and discovery mechanics have not been verified.'],
['Does BuzzDrop reveal my phone number?','The product intent is to avoid requiring phone-number sharing for the exchange. The actual data flow and privacy guarantees need confirmation before a definitive answer can be given.'],
['Do both people need to consent?','The final consent model has not been verified in the supplied source. Do not assume that nearby discovery or connection is active.'],
['Can I turn off or limit nearby discovery?','The precise BuzzDrop visibility and opt-out controls have not been confirmed.'],
['What happens after exchanging Buzz IDs?','The intended result is a Buzz identity connection. The exact follow-on behaviour depends on the completed lookup and contact-exchange flow.']
]],
['Updates and communities',[
['What are Updates?','Updates are the social sharing and discovery experience within Buzz. The app source includes an Updates tab and local status creation interfaces.'],
['How are social Updates different from Security Updates?','Social Updates are everyday content shared by users. Security Updates are intended to communicate safety-related information. They should not be treated as the same feature.'],
['Who can see my Updates?','Audience and visibility rules have not been fully verified. Check the in-app settings and approved privacy documentation before sharing sensitive information.'],
['What are communities?','Communities are spaces intended to bring people together around shared interests or topics. The supplied app includes community screens, but server-backed operation is unverified.'],
['Can I discover nearby content?','Location and area filters appear in parts of the app. The exact live nearby content service and geographic availability have not been confirmed.'],
['Can I report inappropriate content?','The reporting and moderation policy and connected reporting workflow need approval and backend verification. Use the official support route when it becomes available.']
]],
['Privacy and security',[
['What personal information does Buzz collect?','The approved privacy policy has not been supplied. We cannot provide a definitive list of collected data until the production services and policy are confirmed.'],
['Who can see my phone number?','The visibility rules have not been verified. Do not assume that phone numbers are hidden or shared in a particular way without checking the final privacy controls.'],
['How are chats and media protected?','The supplied source does not establish the production security architecture or end-to-end encryption. We do not make absolute security claims.'],
['What privacy controls are available?','The app includes profile and privacy settings. The exact controls and server-side enforcement need to be verified against the production build.'],
['How do I block or report someone?','The full block/report workflow and enforcement policy were not established by the supplied source.'],
['How do I manage location and contact permissions?','The app requests device permissions for selected features. You can review app permissions in your device settings; exact feature requirements will be documented after verification.'],
['How do I request account/data support?','Use the Contact page for the appropriate support route once it is connected. The current website form does not transmit enquiries.']
]],
['Buzz Pro',[
['What is Buzz Pro?','Buzz Pro is an optional mode within the same Buzz app for sellers, businesses, lawyers and other professional users.'],
['Is Buzz Pro a separate app?','No. Buzz Pro is a mode within the Buzz app, not a separate application.'],
['How do I switch to Pro mode?','The supplied app includes Pro mode controls in the Me area. The final account eligibility and activation process must be confirmed.'],
['Who can use Buzz Pro?','The product brief identifies sellers, businesses, lawyers and other professional users. Final eligibility and verification rules have not been supplied.'],
['Can sellers create business profiles?','Business profile setup and preview screens exist in the app. Public publishing and customer visibility depend on backend connections that are not established in the supplied source.'],
['Can lawyers and professionals use Pro?','The intended Pro audience includes lawyers and other professionals. Professional verification and onboarding requirements need confirmation.'],
['How do customers contact a Pro user?','The intended journey connects a professional presence with customer conversations. A live cross-user messaging backend was not found in the supplied source.'],
['Can I list products or services?','The app includes local listing and service interfaces. A connected public catalog and live listing publication are not confirmed.'],
['What business tools are available?','The Pro workspace includes profile, creator, orders, bookings, analytics and payment interfaces in varying stages. Some screens use local data or samples and should not be treated as connected services.']
]],
['Showcase and Creator Tools',[
['What is Showcase?','Showcase is the reel-style experience for eligible Buzz Pro users to create short videos about businesses, products or professional services.'],
['Where do ordinary users find Showcase?','The product brief places Showcase viewing in the Me tab for ordinary Buzz users. The supplied app also contains a reels viewing interface.'],
['Who can create Showcase reels?','The intended creators are eligible Buzz Pro users. The final eligibility and publishing rules need confirmation.'],
['Can sellers showcase products and businesses?','That is part of the intended Showcase use case. Cross-user publishing is not connected in the supplied app source.'],
['Can lawyers/professionals showcase services?','That is part of the intended Showcase use case for eligible Pro users. Publishing and moderation rules need confirmation.'],
['How do I create and publish a reel?','The app contains camera, gallery, editing and local reel-management interfaces. Reels are stored on the device and are not uploaded to other users in the supplied build.'],
['What creator tools are available?','The supplied app includes a creator studio, camera, editor and reel analytics screens. The final Creator Tools inventory should be confirmed before promising additional tools.'],
['Can I edit, remove or manage content?','Local reel editing and deletion interfaces exist. Server-side content management is not connected.'],
['What analytics are available?','The current reel analytics screen derives counts from reels watched on the device. It is not network-wide business analytics.'],
['Can I see who watched or engaged?','Viewer identity and cross-user engagement reporting were not established in the supplied source.'],
['How is Showcase content moderated?','A complete moderation policy and enforcement workflow were not supplied.']
]],
['Marketplace and property',[
['What can I discover in Marketplace?','The intended categories include products, property, services, merchants and professionals.'],
['How do I find products, property or services?','The app includes search and category/filter interfaces backed by local examples. A connected live catalog was not found.'],
['Can I search by location?','Location and area filtering interfaces exist in the app. The current data source is local/seeded and does not establish live geographic coverage.'],
['How are prices and listing details displayed?','Product and property detail interfaces display local example data. Final listing fields and seller-provided information rules need confirmation.'],
['Who can create a property listing?','Landlords, agents and caretakers with different roles were discussed in the project background. The actual authority, approval and verification workflow was not established.'],
['What is the difference between landlord, agent and caretaker?','These roles have different authority in the intended property journey. Buzz needs an approved role definition and verification process before publishing definitive permissions.'],
['How can I report a misleading listing?','A verified reporting and dispute process was not supplied. Contact/support routing must be connected before promising a resolution path.'],
['Does Buzz verify every seller/property listing?','No such universal verification capability was established by the supplied source. Do not assume every seller or listing is verified.'],
['How do I contact a seller/provider?','The app includes chat and seller-related interfaces. Live seller availability and server-backed messaging are not confirmed.']
]],
['SunPay and payments',[
['What is the relationship between Buzz and SunPay?','The project brief describes a partnership with SunPay for secure payment and escrow-related functionality. Buzz should not be described as owning or independently operating SunPay infrastructure.'],
['Who processes a payment?','The processor and operational responsibilities have not been confirmed in the supplied materials.'],
['What does escrow mean in a Buzz transaction?','Escrow-related functionality is part of the partnership proposition. The exact eligible transactions, custody arrangement and release conditions have not been supplied.'],
['Who holds funds and when are they released?','Funds custody and release triggers require explicit confirmation from the responsible payment parties.'],
['Which transactions are eligible for escrow?','Eligibility rules have not been provided. Do not assume every Marketplace purchase is covered.'],
['Which payment methods/currencies are supported?','Supported methods and currencies have not been confirmed.'],
['How do refunds work?','Refund rules and responsibilities have not been supplied.'],
['How are payment disputes handled?','The dispute process and responsible support party need confirmation.'],
['Who do I contact about a failed payment?','A verified payment support destination has not been supplied. Use the Contact page for general enquiries once its routing service is connected.']
]],
['Buzz Logistics and tracking',[
['What is Buzz Logistics?','Buzz Logistics is a partner network and coordination layer connecting Buzz customers with independent logistics companies for delivery of goods/products purchased through Buzz.'],
['Does Buzz Logistics provide passenger rides?','No. Buzz Logistics is not passenger ride-hailing.'],
['Can I use it for goods purchased outside Buzz?','The defined scope is goods/products purchased through the Buzz app. It is not positioned as a general open courier booking service.'],
['What delivery areas are supported?','Confirmed cities, states and countries have not been supplied.'],
['Are intrastate/interstate deliveries supported?','These are delivery scopes described in the project brief, but active locations and operational availability are not confirmed.'],
['Are international deliveries supported?','International delivery is part of the proposed scope. Active countries, customs processes and providers have not been confirmed.'],
['How is a provider selected?','Independent logistics providers handle delivery. The exact selection or assignment process has not been documented.'],
['How do I track my package?','Use the tracking reference when the live tracking service is available. The website currently has no connection to a tracking API.'],
['Where do I find my tracking reference?','The final reference location in the app/order journey has not been confirmed. Follow the instructions provided with your actual Buzz delivery.'],
['Why has tracking not changed?','The website cannot currently retrieve live tracking events. Once connected, the provider event feed and update timing will determine what appears.'],
['What if a package is delayed, lost or damaged?','The claims, escalation and support process has not been supplied. Provider responsibilities and logistics terms must be approved before definitive guidance can be published.'],
['Are deliveries insured?','Insurance coverage has not been confirmed. Do not assume a delivery is insured.'],
['How are prices calculated?','Pricing rules, provider quotes, surcharges and payment responsibility have not been supplied.'],
['Who pays customs duties/taxes?','Customs and tax responsibility needs to be confirmed in the logistics terms and applicable provider arrangements.'],
['Which goods cannot be shipped?','A confirmed prohibited-goods list has not been supplied.'],
['How do I contact delivery support?','A dedicated delivery support channel has not been supplied. Use general Contact only when the enquiry route is live.']
]],
['Logistics partners',[
['Who can become a partner?','Independent logistics companies with relevant operating capability may express interest. All applications are subject to assessment and approval.'],
['What documents are required?','The final legal documents, licences and insurance requirements have not been confirmed. The application asks for business and jurisdiction details but does not imply approval.'],
['How does assessment and approval work?','A review and approval process is intended. The reviewer, service levels and response timeline have not been supplied.'],
['Which delivery services can a partner offer?','The application asks providers to describe domestic, international, combined or other shipping services. Actual service categories depend on approved partner scope.'],
['How do partners specify coverage?','The application includes states/cities served, countries covered and international shipment experience. The final approved coverage record will need to be maintained by the partner system.'],
['Can a partner integrate existing logistics software?','The application asks about existing software and API availability. API integration capability and supported standards have not been confirmed.'],
['Is API integration available?','It is an integration enquiry topic, not a confirmed production feature.'],
['How do employees access the portal?','The partner portal and employee access controls are not connected in this website build.'],
['How are deliveries assigned and tracked?','The live assignment and status feed depend on logistics APIs and provider workflows that have not been supplied.'],
['How are partner fees/settlements handled?','Partner fee and settlement arrangements have not been provided.']
]],
['Safety',[
['What is EMBA?','EMBA is named in the project brief as part of the safety experience, but its approved definition and operational workflow were not supplied.'],
['What are Security Updates?','Security Updates are intended to communicate safety-related information and should remain distinct from ordinary social Updates.'],
['How are location-based alerts generated?','The alert sources, geographic rules, verification process and delivery mechanism have not been confirmed.'],
['How do I report an incident?','An incident-related interface exists in the app source. The live submission, review and escalation service is not established.'],
['Can I submit evidence?','The evidence storage, upload, access and retention process has not been confirmed.'],
['Who can see a report?','Report visibility and access controls require an approved policy and backend permissions.'],
['Does Buzz verify every incident?','No universal incident-verification capability was established. Do not assume every report is independently verified.'],
['Does Buzz contact emergency services for me?','The supplied materials do not establish an emergency dispatch service. Contact the appropriate local emergency service directly in an immediate emergency.'],
['Can law enforcement access information?','The lawful disclosure policy and process have not been supplied. Refer to the approved privacy and legal policies when available.'],
['What are Trusted Contacts, Rescue Mode, Stealth and Security Live?','These concepts appear in prior product discussions or app screens, but their final availability, triggers and operational behaviour are not verified.'],
['What should I do in an immediate emergency?','Contact the appropriate local emergency service or trusted local emergency resource directly. Do not wait for Buzz or an in-app response.']
]],
['Careers and support',[
['How do I apply for a job?','No verified vacancies or application endpoint were supplied. Check the Careers page for confirmed openings.'],
['How do I contact Buzz?','Use the Contact page. The current form is a front-end preview and will not send your message until the contact service is connected.'],
['How do I report a technical issue?','Use the app support route when it is connected. Do not include passwords or payment credentials in a general enquiry.'],
['How do I propose a partnership?','Use the Contact page and select the business/partnership enquiry category when the form destination is available.'],
['Where can I download Buzz?','Official app store URLs were not supplied. Store availability is not confirmed.'],
['How do I request account help?','A production account-support and recovery route has not been supplied. Use official Buzz contact information when published.']
]]
];
window.BUZZ_FAQ_CATEGORIES=categories;
window.BUZZ_PAGE_RENDERERS=window.BUZZ_PAGE_RENDERERS||{};
window.BUZZ_PAGE_RENDERERS['/help']=()=>`<section class="help-hero section-wrap"><p class="eyebrow"><span class="eyebrow-line"></span> BUZZ / HELP CENTRE</p><h1>Good questions<br><em>deserve clear answers.</em></h1><p>Search practical answers about Buzz, the app, professional tools, Marketplace, payments, safety and Buzz Logistics. Where a service is not connected or confirmed, we say so.</p><label class="help-search"><span aria-hidden="true">⌕</span><input id="faq-search" type="search" placeholder="Search questions or topics…" autocomplete="off"><button id="faq-clear" type="button" aria-label="Clear search">×</button></label><div class="help-meta"><span id="faq-count">Loading questions</span><span>Answers reflect the current verified project information.</span></div></section><section class="help-content section-wrap"><aside class="help-categories" id="faq-categories">${categories.map((c,i)=>`<button type="button" data-category="${i}" class="${i===0?'is-active':''}">${c[0]} <span>${c[1].length}</span></button>`).join('')}</aside><div class="faq-results" id="faq-results"></div></section><section class="help-contact"><div class="section-wrap"><div><p class="eyebrow eyebrow-light"><span class="eyebrow-line"></span> Still need help?</p><h2>We can help you<br><em>find the next step.</em></h2></div><a class="button button-white" href="/contact">Contact Buzz ↗</a></div></section>`;
})();
