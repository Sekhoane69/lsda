// Starter course content in English and Sesotho.
// The Sesotho is a careful draft written in Lesotho orthography. BEFORE THE PILOT, ask a fluent
// Sesotho speaker (ideally someone from the partner community) to read it and correct it.
// Corrections can be made on the Manage page, or here followed by `npm run content:update`.
//
// Each course has TWO different question sets:
//   pre  = starter quiz (baseline, taken once, before any lesson)
//   post = final assessment (after all lessons; pass mark 70%)
// The two sets cover the same skills at the same level, so a higher final score shows learning,
// not memory of the starter questions.

const L = (title_en, title_so, body_en, body_so) => ({ title_en, title_so, body_en, body_so });
// Q(English question, English options, Sesotho question, Sesotho options, index of correct option)
const Q = (text_en, options_en, text_so, options_so, correct) => ({ text_en, options_en, text_so, options_so, correct });

module.exports = [
  // ------------------------------------------------------------------ 1
  {
    title_en: 'Smartphone and Mobile Applications', title_so: 'Mohala o Bohlale le Li-App',
    description_en: 'Learn to use your smartphone with confidence: settings, WhatsApp, email, apps and staying safe from scams.',
    description_so: 'Ithute ho sebelisa mohala oa hau o bohlale ka kholiseho: litlhophiso, WhatsApp, imeile, li-app le ho qoba bomenemene.',
    lessons: [
      L('Finding your way around your phone', 'Ho tseba mohala oa hau',
        'Your phone has a home screen, a settings app and a place where apps are kept.\n\n- Tap the gear icon to open Settings.\n- In Settings you can change the language, the screen brightness and the volume.\n- Turn on Wi-Fi only when you are near a network you trust.\n\nTip: if your battery is low, turn on Battery Saver in Settings.',
        'Mohala oa hau o na le skrini ea lehae, app ea litlhophiso le sebaka moo li-app li bolokoang teng.\n\n- Tobetsa letšoao la lebili (gear) ho bula Litlhophiso (Settings).\n- Ho Litlhophiso u ka fetola puo, khanya ea skrini le molumo.\n- Bulela Wi-Fi feela ha u le haufi le marang-rang ao u a tšepang.\n\nKeletso: haeba betri ea hau e le tlase, bulela Battery Saver ho Litlhophiso.'),
      L('Using WhatsApp', 'Ho sebelisa WhatsApp',
        'WhatsApp lets you send messages, photos and voice notes using mobile data or Wi-Fi.\n\n- Open WhatsApp and tap the green message icon to start a chat.\n- Type your message and press the send arrow.\n- Hold the microphone button to record a voice note.\n\nMessages use very little data. Photos and videos use much more.',
        'WhatsApp e u lumella ho romela melaetsa, litšoantšo le melaetsa ea lentsoe u sebelisa data ea mohala kapa Wi-Fi.\n\n- Bula WhatsApp mme u tobetse letšoao le letala la molaetsa ho qala puisano.\n- Ngola molaetsa oa hau mme u tobetse motsu oa ho romela.\n- Tšoara konopo ea maekrofone ho rekota molaetsa oa lentsoe.\n\nMelaetsa e ngotsoeng e sebelisa data e nyane haholo. Litšoantšo le livideo li sebelisa data e ngata haholo.'),
      L('Downloading apps and avoiding scams', 'Ho kopitsa li-app le ho qoba bomenemene',
        'Only download apps from the official store on your phone (Play Store or App Store).\n\n- Never share your PIN or one-time password (OTP) with anyone, even if they say they are from your bank.\n- Do not click links in messages from people you do not know.\n- If an offer sounds too good to be true, it is probably a scam.',
        'Kopitsa li-app feela lebenkeleng la semmuso la mohala oa hau (Play Store kapa App Store).\n\n- Le ka mohla u se ke ua arolelana PIN ea hau kapa phasewete ea nakoana (OTP) le motho ofe kapa ofe, leha a re o tsoa bankeng ea hau.\n- U se ke ua tobetsa mahokelo (links) a melaetsa e tsoang ho batho bao u sa ba tsebeng.\n- Haeba tlhahiso e utloahala e le ntle haholo hore e ka ba \'nete, ka monyetla o moholo ke bomenemene.')
    ],
    pre: [
      Q('What does Battery Saver do?', ['Makes the phone louder', 'Helps the battery last longer', 'Deletes your apps', 'Turns off the screen forever'],
        'Battery Saver e etsa eng?', ['E etsa hore mohala o lle haholo', 'E thusa hore betri e nke nako e telele', 'E hlakola li-app tsa hau', 'E tima skrini ka ho sa feleng'], 1),
      Q('What is a voice note on WhatsApp?', ['A phone call', 'A photo', 'A short recorded spoken message', 'A ringtone'],
        'Molaetsa oa lentsoe ho WhatsApp ke eng?', ['Mohala oa ho letsetsa', 'Setšoantšo', 'Molaetsa o mokhutšoane o rekotiloeng ka lentsoe', 'Molumo oa ho lla ha mohala'], 2),
      Q('A message from an unknown number has a link to "claim your prize". What should you do?', ['Click the link quickly', 'Do not click it; delete the message', 'Forward it to your friends', 'Reply with your PIN'],
        'Molaetsa o tsoang nomorong eo u sa e tsebeng o na le lehokelo la "nka moputso oa hau". U lokela ho etsa eng?', ['Tobetsa lehokelo kapele', 'U se ke ua le tobetsa; hlakola molaetsa', 'O romelle metsoalle ea hau', 'Araba ka PIN ea hau'], 1),
      Q('When is it safest to turn on Wi-Fi?', ['Anywhere at all', 'Only at night', 'When you are near a network you trust', 'Never'],
        'Ke neng moo ho bolokehileng haholo ho bulela Wi-Fi?', ['Kae kapa kae', 'Bosiu feela', 'Ha u le haufi le marang-rang ao u a tšepang', 'Le ka mohla'], 2)
    ],
    post: [
      Q('Where should you download apps from?', ['Links sent on WhatsApp', 'The official app store on your phone', 'Any website', 'A stranger'],
        'U lokela ho kopitsa li-app hokae?', ['Mahokelong a romeloang ka WhatsApp', 'Lebenkeleng la semmuso la li-app mohaleng oa hau', 'Webosaeteng efe kapa efe', 'Ho motho eo u sa mo tsebeng'], 1),
      Q('Someone calls and asks for your one-time password (OTP). What should you do?', ['Give it to them quickly', 'Share it only if they say they are from the bank', 'Never share it with anyone', 'Send it by SMS'],
        'Motho o u letsetsa mme o kopa phasewete ea hau ea nakoana (OTP). U lokela ho etsa eng?', ['Mo fe eona kapele', 'E arolelane feela haeba a re o tsoa bankeng', 'Le ka mohla u se ke ua e arolelana le motho', 'E romele ka SMS'], 2),
      Q('Which uses the MOST mobile data?', ['A short text message', 'A voice note of 5 seconds', 'A long video', 'A typed emoji'],
        'Ke efe e sebelisang data e NGATA ka ho fetisisa?', ['Molaetsa o mokhutšoane o ngotsoeng', 'Molaetsa oa lentsoe oa metsotsoana e 5', 'Video e telele', 'Emoji e ngotsoeng'], 2),
      Q('Where do you change your phone language and brightness?', ['Settings', 'Camera', 'Calculator', 'Contacts'],
        'U fetola puo le khanya ea mohala oa hau hokae?', ['Litlhophiso (Settings)', 'Khamera', 'Sebali (Calculator)', 'Mabitso (Contacts)'], 0)
    ]
  },
  // ------------------------------------------------------------------ 2
  {
    title_en: 'Basic Computer Skills', title_so: 'Lintho Tsa Mantlha Tsa Khomphuta',
    description_en: 'Start from zero: the keyboard and mouse, files and folders, the internet and email.',
    description_so: 'Qala ho tloha qalong: keyboard le mouse, lifaele le lifoldara, inthanete le imeile.',
    lessons: [
      L('Meeting the computer', 'Ho tseba khomphuta',
        'A computer has a screen, a keyboard, a mouse and the main box (or the whole laptop).\n\n- Press the power button once to switch on.\n- Move the mouse to move the pointer on the screen.\n- Click the left button once to select, twice quickly to open.\n\nAlways shut down from the Start menu before you switch off.',
        'Khomphuta e na le skrini, keyboard, mouse le lebokose le leholo (kapa laptop kaofela).\n\n- Tobetsa konopo ea motlakase hang ho e bulela.\n- Tsamaisa mouse ho tsamaisa motsu skrining.\n- Tobetsa konopo e ka letsohong le letšehali hang ho khetha, habeli kapele ho bula.\n\nKamehla tima khomphuta ka Start menu pele u e tima motlakase.'),
      L('Files and folders', 'Lifaele le lifoldara',
        'A file is a single document, picture or song. A folder is a container that holds files.\n\n- Right-click on an empty space and choose New, then Folder.\n- Give the folder a clear name such as CV Documents.\n- Drag a file into the folder to keep your work organised.\n\nSave your work often so you do not lose it.',
        'Faele ke tokomane e le \'ngoe, setšoantšo kapa pina. Foldara ke setšelo se bolokang lifaele.\n\n- Tobetsa ka konopo e ka letsohong le letona sebakeng se se nang letho mme u khethe New, ebe Folder.\n- Fa foldara lebitso le hlakileng joalo ka CV Documents.\n- Hula faele u e kenye ka har\'a foldara hore mosebetsi oa hau o hlophehe.\n\nBoloka mosebetsi oa hau khafetsa hore o se ke oa lahleha.'),
      L('Using the internet and email', 'Ho sebelisa inthanete le imeile',
        'A web browser (like Chrome) lets you visit websites. Type the address at the top, or type what you want into a search engine.\n\n- An email address looks like name@example.com.\n- To send email: click Compose, type the address, a subject and your message, then click Send.\n- Attach a file with the paperclip icon.',
        'Sebatli sa marang-rang (browser, joalo ka Chrome) se u lumella ho etela liwebosaete. Ngola aterese kaholimo, kapa u ngole seo u se batlang ho search engine.\n\n- Aterese ea imeile e shebahala tjena: name@example.com.\n- Ho romela imeile: tobetsa Compose, ngola aterese, sehlooho le molaetsa oa hau, ebe u tobetsa Send.\n- Hokela faele ka letšoao la sekhomaretsi sa pampiri (paperclip).')
    ],
    pre: [
      Q('What is a file?', ['A container that holds folders', 'A single document, picture or song', 'A key on the keyboard', 'A computer cable'],
        'Faele ke eng?', ['Setšelo se bolokang lifoldara', 'Tokomane e le \'ngoe, setšoantšo kapa pina', 'Konopo ho keyboard', 'Terata ea khomphuta'], 1),
      Q('Which mouse button do you click once to select something?', ['The left button', 'The power button', 'The Esc key', 'The speaker'],
        'U tobetsa konopo efe ea mouse hang ho khetha ho hong?', ['Konopo e ka letsohong le letšehali', 'Konopo ea motlakase', 'Konopo ea Esc', 'Sebui (speaker)'], 0),
      Q('What do you click to start writing a new email?', ['Delete', 'Spam', 'Log out', 'Compose'],
        'U tobetsa eng ho qala ho ngola imeile e ncha?', ['Delete', 'Spam', 'Log out', 'Compose'], 3),
      Q('Which icon is used to attach a file to an email?', ['A bin', 'A paperclip', 'A star', 'A clock'],
        'Ke letšoao lefe le sebelisoang ho hokela faele imeileng?', ['Moqomo oa litšila', 'Sekhomaretsi sa pampiri (paperclip)', 'Naleli', 'Oache'], 1)
    ],
    post: [
      Q('What is a folder?', ['A type of virus', 'A container that holds files', 'A kind of printer', 'A website'],
        'Foldara ke eng?', ['Mofuta oa vaerase', 'Setšelo se bolokang lifaele', 'Mofuta oa printa', 'Webosaete'], 1),
      Q('How do you open a file or folder with the mouse?', ['Click once with the right button', 'Double-click with the left button', 'Hold the keyboard', 'Press power'],
        'U bula faele kapa foldara joang ka mouse?', ['Tobetsa hang ka konopo e ka letsohong le letona', 'Tobetsa habeli kapele ka konopo e ka letsohong le letšehali', 'Tšoara keyboard', 'Tobetsa konopo ea motlakase'], 1),
      Q('Which is a correct email address?', ['name.example.com', 'name@example.com', 'name@@com', 'www.name'],
        'Ke efe aterese ea imeile e nepahetseng?', ['name.example.com', 'name@example.com', 'name@@com', 'www.name'], 1),
      Q('How should you switch off a computer?', ['Pull out the plug', 'Use Shut down in the Start menu', 'Close the lid only', 'Hold the mouse'],
        'U lokela ho tima khomphuta joang?', ['Ntša plaka', 'Sebelisa Shut down ho Start menu', 'Koala sekoahelo feela', 'Tšoara mouse'], 1)
    ]
  },
  // ------------------------------------------------------------------ 3
  {
    title_en: 'Microsoft Office Skills', title_so: 'Mahlale a Microsoft Office',
    description_en: 'Type a CV in Word, make a simple budget in Excel and build a presentation in PowerPoint.',
    description_so: 'Thaepa CV ho Word, etsa tekanyetso ea chelete ho Excel mme u hahe pontšo ho PowerPoint.',
    lessons: [
      L('Word: typing a CV or letter', 'Word: ho thaepa CV kapa lengolo',
        'Microsoft Word is used to write letters, CVs and reports.\n\n- Use a clear font such as Arial or Calibri, size 11 or 12.\n- Use Bold for headings like Education and Experience.\n- Press Ctrl+S to save your document often.\n- Use File, then Print, to print it.',
        'Microsoft Word e sebelisoa ho ngola mangolo, li-CV le litlaleho.\n\n- Sebelisa mongolo o hlakileng joalo ka Arial kapa Calibri, boholo ba 11 kapa 12.\n- Sebelisa Bold bakeng sa lihlooho tse kang Thuto (Education) le Boiphihlelo (Experience).\n- Tobetsa Ctrl+S khafetsa ho boloka tokomane ea hau.\n- Sebelisa File, ebe Print, ho e hatisa.'),
      L('Excel: a simple budget', 'Excel: tekanyetso e bonolo ea chelete',
        'Excel is a grid of rows and columns. Each box is called a cell.\n\n- Type your income in one cell and each expense in the cells below it.\n- To add numbers, type =SUM( then select the cells and press Enter.\n- A formula always starts with the equals sign (=).\n\nExample: =B2-B3 subtracts the value in B3 from B2.',
        'Excel ke letlapa la mela e tšekaletseng le e emeng. Lebokose ka leng le bitsoa cell.\n\n- Ngola chelete eo u e fumanang cell e le \'ngoe, le tšebeliso e \'ngoe le e \'ngoe li-cell tse ka tlase ho eona.\n- Ho kopanya linomoro, ngola =SUM( ebe u khetha li-cell mme u tobetse Enter.\n- Foromo kamehla e qala ka letšoao la tekano (=).\n\nMohlala: =B2-B3 e ntša boleng ba B3 ho B2.'),
      L('PowerPoint: making a presentation', 'PowerPoint: ho etsa pontšo',
        'PowerPoint helps you show ideas on slides.\n\n- Keep each slide simple: a short heading and a few points.\n- Use large text so people at the back can read it.\n- Add a picture with Insert, then Pictures.\n- Press F5 to start the slide show.',
        'PowerPoint e u thusa ho bontša mehopolo ka li-slide.\n\n- Etsa hore slide ka \'ngoe e be bonolo: sehlooho se sekhutšoane le lintlha tse \'maloa.\n- Sebelisa mongolo o moholo hore batho ba ka morao ba khone ho o bala.\n- Kenya setšoantšo ka Insert, ebe Pictures.\n- Tobetsa F5 ho qala pontšo ea li-slide.')
    ],
    pre: [
      Q('Which program is best for a simple budget with numbers?', ['Word', 'Excel', 'PowerPoint', 'Paint'],
        'Ke lenaneo lefe le loketseng ka ho fetisisa bakeng sa tekanyetso e bonolo ea chelete e nang le linomoro?', ['Word', 'Excel', 'PowerPoint', 'Paint'], 1),
      Q('What is one box in an Excel grid called?', ['A page', 'A slide', 'A cell', 'A folder'],
        'Lebokose le le leng letlapeng la Excel le bitsoa eng?', ['Leqephe', 'Slide', 'Cell', 'Foldara'], 2),
      Q('How do you print a document in Word?', ['File, then Print', 'Press Ctrl+S', 'Press F5', 'Insert, then Pictures'],
        'U hatisa tokomane joang ho Word?', ['File, ebe Print', 'Tobetsa Ctrl+S', 'Tobetsa F5', 'Insert, ebe Pictures'], 0),
      Q('Which formula adds up the cells B2 to B5?', ['=ADD B2 B5', '=SUM(B2:B5)', 'SUM B2-B5', '+B2B5'],
        'Ke foromo efe e kopanyang li-cell ho tloha ho B2 ho isa ho B5?', ['=ADD B2 B5', '=SUM(B2:B5)', 'SUM B2-B5', '+B2B5'], 1)
    ],
    post: [
      Q('Which keys save your document?', ['Ctrl+S', 'Ctrl+P', 'Alt+F4', 'Shift+Z'],
        'Ke likonopo life tse bolokang tokomane ea hau?', ['Ctrl+S', 'Ctrl+P', 'Alt+F4', 'Shift+Z'], 0),
      Q('What must every Excel formula start with?', ['A plus sign', 'A hash sign', 'An equals sign (=)', 'A dollar sign'],
        'Foromo e \'ngoe le e \'ngoe ea Excel e tlameha ho qala ka eng?', ['Letšoao la ho kopanya (+)', 'Letšoao la hash (#)', 'Letšoao la tekano (=)', 'Letšoao la dolara ($)'], 2),
      Q('Which program is best for typing a CV?', ['Excel', 'Word', 'Calculator', 'Paint'],
        'Ke lenaneo lefe le loketseng ka ho fetisisa ho thaepa CV?', ['Excel', 'Word', 'Calculator', 'Paint'], 1),
      Q('Which key starts a PowerPoint slide show?', ['F5', 'F1', 'Esc', 'Tab'],
        'Ke konopo efe e qalang pontšo ea li-slide ho PowerPoint?', ['F5', 'F1', 'Esc', 'Tab'], 0)
    ]
  },
  // ------------------------------------------------------------------ 4
  {
    title_en: 'Introduction to Website Development', title_so: 'Selelekela sa ho Haha Liwebosaete',
    description_en: 'Learn what a website is and build a simple personal web page with HTML and CSS.',
    description_so: 'Ithute hore webosaete ke eng mme u hahe leqephe le bonolo la hau ka HTML le CSS.',
    lessons: [
      L('What is a website?', 'Webosaete ke eng?',
        'A website is a group of pages stored on a computer called a server, which you can open with a browser.\n\n- Every website has an address, for example www.example.com.\n- Pages are written in a language called HTML.\n- A style language called CSS controls colours and layout.',
        'Webosaete ke sehlopha sa maqephe a bolokiloeng khomphuteng e bitsoang server, ao u ka a bulang ka sebatli (browser).\n\n- Webosaete e \'ngoe le e \'ngoe e na le aterese, mohlala www.example.com.\n- Maqephe a ngoloa ka puo e bitsoang HTML.\n- Puo ea moralo e bitsoang CSS e laola mebala le tlhophiso ea leqephe.'),
      L('Your first HTML page', 'Leqephe la hau la pele la HTML',
        'HTML uses tags. A tag is written inside angle brackets.\n\n- <h1>My Name</h1> makes a big heading.\n- <p>I am learning.</p> makes a paragraph.\n- <img src="photo.jpg"> adds a picture.\n- <a href="https://example.com">Click here</a> makes a link.\n\nSave the file as index.html and double-click it to open it in your browser.',
        'HTML e sebelisa li-tag. Tag e ngoloa ka har\'a masakaneng a sekhutlo < >.\n\n- <h1>Lebitso la ka</h1> e etsa sehlooho se seholo.\n- <p>Kea ithuta.</p> e etsa serapa.\n- <img src="photo.jpg"> e kenya setšoantšo.\n- <a href="https://example.com">Tobetsa mona</a> e etsa lehokelo.\n\nBoloka faele e le index.html mme u e tobetse habeli ho e bula sebatling sa hau.'),
      L('Adding style with CSS', 'Ho eketsa moralo ka CSS',
        'CSS changes how your page looks.\n\n- h1 { color: blue; } makes all headings blue.\n- p { font-size: 18px; } makes paragraph text bigger.\n- body { background: white; } sets the page colour.\n\nTo publish for free, you can use a service such as GitHub Pages.',
        'CSS e fetola tsela eo leqephe la hau le shebahalang ka eona.\n\n- h1 { color: blue; } e etsa hore lihlooho tsohle e be tse putsoa.\n- p { font-size: 18px; } e etsa hore mongolo oa serapa o be moholoanyane.\n- body { background: white; } e beha \'mala oa leqephe.\n\nHo phatlalatsa mahala, u ka sebelisa tšebeletso e kang GitHub Pages.')
    ],
    pre: [
      Q('Which program do you use to open a website?', ['A web browser', 'A calculator', 'A spreadsheet', 'A music player'],
        'U sebelisa lenaneo lefe ho bula webosaete?', ['Sebatli sa marang-rang (browser)', 'Sebali (calculator)', 'Letlapa la lipalo (spreadsheet)', 'Sebapali sa \'mino'], 0),
      Q('Which tag makes a paragraph?', ['<h1>', '<img>', '<p>', '<a>'],
        'Ke tag efe e etsang serapa?', ['<h1>', '<img>', '<p>', '<a>'], 2),
      Q('Which tag makes a link to another page?', ['<a>', '<p>', '<h1>', '<body>'],
        'Ke tag efe e etsang lehokelo le eang leqepheng le leng?', ['<a>', '<p>', '<h1>', '<body>'], 0),
      Q('Where are website pages stored so that people can open them?', ['In a printer', 'On a server', 'In a mouse', 'On a SIM card'],
        'Maqephe a webosaete a bolokoa hokae hore batho ba khone ho a bula?', ['Printeng', 'Ho server', 'Ka har\'a mouse', 'Ho SIM card'], 1)
    ],
    post: [
      Q('What does HTML do?', ['It sends email', 'It describes the content of a web page', 'It cleans the computer', 'It stores passwords'],
        'HTML e etsa eng?', ['E romela imeile', 'E hlalosa litaba tsa leqephe la webosaete', 'E hloekisa khomphuta', 'E boloka liphasewete'], 1),
      Q('Which tag makes a big heading?', ['<p>', '<h1>', '<a>', '<img>'],
        'Ke tag efe e etsang sehlooho se seholo?', ['<p>', '<h1>', '<a>', '<img>'], 1),
      Q('What does CSS control?', ['Colours and layout', 'Internet speed', 'Battery', 'Email'],
        'CSS e laola eng?', ['Mebala le tlhophiso ea leqephe', 'Lebelo la inthanete', 'Betri', 'Imeile'], 0),
      Q('What file name is usually used for the main page of a website?', ['main.exe', 'index.html', 'page.doc', 'home.mp3'],
        'Ke lebitso lefe la faele le atisang ho sebelisoa bakeng sa leqephe le ka sehloohong la webosaete?', ['main.exe', 'index.html', 'page.doc', 'home.mp3'], 1)
    ]
  },
  // ------------------------------------------------------------------ 5
  {
    title_en: 'Online Job Applications', title_so: 'Ho Kopa Mesebetsi ka Inthanete',
    description_en: 'Search for jobs online, write a strong CV and application letter, apply online and spot fake job adverts.',
    description_so: 'Batla mesebetsi ka inthanete, ngola CV le lengolo la kopo, kopa mosebetsi ka inthanete mme u tsebe ho khetholla litsebiso tsa mesebetsi tsa bohata.',
    lessons: [
      L('Searching for jobs online', 'Ho batla mesebetsi ka inthanete',
        'Jobs are advertised on company websites, government sites, newspapers online and social media groups.\n\n- Use search words like "jobs Maseru" or "internship Lesotho".\n- Read the closing date and the requirements carefully.\n- Save the advert so you can refer to it later.',
        'Mesebetsi e phatlalatsoa liwebosaeteng tsa likhoebo, liwebosaeteng tsa \'muso, likoranteng tsa inthanete le lihlopheng tsa marang-rang a sechaba (social media).\n\n- Sebelisa mantsoe a ho batla a kang "jobs Maseru" kapa "internship Lesotho".\n- Bala letsatsi la ho koala le litlhoko ka hloko.\n- Boloka tsebiso hore u tle u e shebe hamorao.'),
      L('Your CV and application letter', 'CV ea hau le lengolo la kopo',
        'A good CV is one or two pages long.\n\n- Put your name, phone number and email at the top.\n- List your education and work or volunteer experience, newest first.\n- Add two referees who agreed to support you.\n- Your letter should say which job you want and why you are suitable. Keep it to one page.',
        'CV e ntle e na le leqephe le le leng kapa a mabeli.\n\n- Beha lebitso la hau, nomoro ea mohala le imeile kaholimo.\n- Thathamisa thuto ea hau le boiphihlelo ba mosebetsi kapa ba boithaopo, ho qala ka bo bocha.\n- Kenya batho ba babeli ba ka u tiisetsang (referees) ba dumetseng ho u tšehetsa.\n- Lengolo la hau le lokela ho bolela hore na u batla mosebetsi ofe le hore na hobaneng u o loketse. Le be leqephe le le leng feela.'),
      L('Applying online and spotting fake adverts', 'Ho kopa ka inthanete le ho tseba litsebiso tsa bohata',
        'Many employers ask you to email your documents or use an online form.\n\n- Save documents as PDF so the layout does not change.\n- Name files clearly, for example Thabo_Mokoena_CV.pdf.\n- A real employer will never ask you to pay money to get a job or an interview.\n- Be careful of adverts that promise very high pay for no experience.',
        'Bahiri ba bangata ba u kopa ho romela litokomane tsa hau ka imeile kapa ho sebelisa foromo ea inthanete.\n\n- Boloka litokomane e le PDF hore tlhophiso ea tsona e se ke ea fetoha.\n- Fa lifaele mabitso a hlakileng, mohlala Thabo_Mokoena_CV.pdf.\n- Mohiri oa \'nete a ke ke a u kopa ho lefa chelete hore u fumane mosebetsi kapa puisano ea mosebetsi (interview).\n- Hlokomela litsebiso tse tšepisang moputso o phahameng haholo ntle le boiphihlelo.')
    ],
    pre: [
      Q('Where can you find job adverts online?', ['Company and government websites', 'Only in songs', 'Only on the radio', 'Nowhere'],
        'U ka fumana litsebiso tsa mesebetsi hokae inthaneteng?', ['Liwebosaeteng tsa likhoebo le tsa \'muso', 'Lipineng feela', 'Seea-le-moeeng feela', 'Ha ho kae'], 0),
      Q('What should be at the top of your CV?', ['Your favourite food', 'Your name, phone number and email', 'A long story about your childhood', 'Nothing'],
        'Ke eng e lokelang ho ba kaholimo ho CV ea hau?', ['Lijo tseo u li ratang', 'Lebitso la hau, nomoro ea mohala le imeile', 'Pale e telele ka bongoana ba hau', 'Ha ho letho'], 1),
      Q('Which is the best name for your CV file?', ['cv final final2.docx', 'document1', 'Thabo_Mokoena_CV.pdf', 'asdfgh'],
        'Ke lebitso lefe le molemo ka ho fetisisa bakeng sa faele ea CV ea hau?', ['cv final final2.docx', 'document1', 'Thabo_Mokoena_CV.pdf', 'asdfgh'], 2),
      Q('An advert promises very high pay with no experience needed. You should:', ['Send money to secure the job', 'Share your ID number at once', 'Ignore every job advert forever', 'Be careful; it may be fake'],
        'Tsebiso e tšepisa moputso o phahameng haholo ntle le boiphihlelo. U lokela ho:', ['Romela chelete ho tiisa mosebetsi', 'Arolelana nomoro ea hau ea boitsebiso hang-hang', 'Hlokomoloha litsebiso tsohle tsa mesebetsi ka ho sa feleng', 'Hlokomela; e ka ba ea bohata'], 3)
    ],
    post: [
      Q('A person says you must pay a fee to get the job. What should you do?', ['Pay quickly', 'Treat it as a likely scam', 'Pay half', 'Send your PIN'],
        'Motho o re u tlameha ho lefa chelete hore u fumane mosebetsi. U lokela ho etsa eng?', ['Lefa kapele', 'Ho nke e le bomenemene bo ka khonehang', 'Lefa halofo', 'Romela PIN ea hau'], 1),
      Q('Which file type keeps your CV layout the same on any device?', ['PDF', 'MP3', 'EXE', 'ZIP only'],
        'Ke mofuta ofe oa faele o bolokang tlhophiso ea CV ea hau e tšoana sesebelisoa sefe kapa sefe?', ['PDF', 'MP3', 'EXE', 'ZIP feela'], 0),
      Q('How long should a good CV usually be?', ['One or two pages', 'Ten pages', 'Half a line', 'Five pages'],
        'Hangata CV e ntle e lokela ho ba bolelele bo bokae?', ['Leqephe le le leng kapa a mabeli', 'Maqephe a leshome', 'Halofo ea mola', 'Maqephe a mahlano'], 0),
      Q('What should you check first in a job advert?', ['The closing date and requirements', 'The font', 'The colour', 'The picture'],
        'U lokela ho sheba eng pele tsebisong ea mosebetsi?', ['Letsatsi la ho koala le litlhoko', 'Mofuta oa mongolo', '\'Mala', 'Setšoantšo'], 0)
    ]
  },
  // ------------------------------------------------------------------ 6
  {
    title_en: 'Digital Safety and Online Services', title_so: 'Polokeho ea Dijithale le Litšebeletso tsa Inthanete',
    description_en: 'Create strong passwords, protect your personal information, recognise fraud and use online services and mobile money safely.',
    description_so: 'Etsa liphasewete tse matla, sireletsa lintlha tsa hau, tseba bomenemene mme u sebelise litšebeletso tsa inthanete le chelete ea mohala ka polokeho.',
    lessons: [
      L('Strong passwords', 'Liphasewete tse matla',
        'A strong password is long and hard to guess.\n\n- Use at least 10 characters with letters, numbers and symbols.\n- Do not use your name, birthday or 123456.\n- Use a different password for each important account.\n- Never tell anyone your passwords.',
        'Phasewete e matla e telele ebile ho thata ho e hakanya.\n\n- Sebelisa bonyane litlhaku tse 10 tse nang le litlhaku, linomoro le matšoao.\n- U se ke ua sebelisa lebitso la hau, letsatsi la tsoalo kapa 123456.\n- Sebelisa phasewete e fapaneng bakeng sa akhaonte e \'ngoe le e \'ngoe ea bohlokoa.\n- Le ka mohla u se ke ua bolella motho liphasewete tsa hau.'),
      L('Protecting your personal information', 'Ho sireletsa lintlha tsa hau',
        'Your ID number, bank details and PIN are private.\n\n- Think before you post photos, your address or your phone number on social media.\n- Log out of accounts on shared phones and computers.\n- Turn on two-step verification when it is offered.',
        'Nomoro ea hau ea boitsebiso (ID), lintlha tsa banka le PIN ke lekunutu.\n\n- Nahana pele u beha litšoantšo, aterese ea hau kapa nomoro ea mohala marang-rang a sechaba.\n- Tsoa ho li-akhaonte tsa hau mehaleng le likhomphuteng tse sebelisoang ke batho ba bangata.\n- Bulela netefatso ea mehato e \'meli (two-step verification) ha e fumaneha.'),
      L('Recognising fraud and using mobile money safely', 'Ho tseba bomenemene le ho sebelisa chelete ea mohala ka polokeho',
        'Fraudsters pretend to be banks, mobile money agents or winners of a prize.\n\n- Real companies never ask for your PIN.\n- Do not send money to claim a prize.\n- Check the name and number before you confirm a mobile money payment.\n- If you are not sure, stop and ask someone you trust or call the company on its official number.',
        'Bamenemene ba iketsa eka ke libanka, baemeli ba chelete ea mohala kapa ba hapileng moputso.\n\n- Likhoebo tsa \'nete ha li u kope PIN ea hau le ka mohla.\n- U se ke ua romela chelete ho nka moputso.\n- Sheba lebitso le nomoro pele u tiisa tefo ea chelete ea mohala.\n- Haeba u sa kholoe, ema mme u botse motho eo u mo tšepang kapa u letsetse khoebo nomorong ea eona ea semmuso.')
    ],
    pre: [
      Q('What makes a password strong?', ['Your name', 'It is long, with letters, numbers and symbols', '123456', 'Your birthday'],
        'Ke eng e etsang hore phasewete e be matla?', ['Lebitso la hau', 'E telele, e na le litlhaku, linomoro le matšoao', '123456', 'Letsatsi la hau la tsoalo'], 1),
      Q('Should you use the same password for every account?', ['Yes, always', 'Only for bank accounts', 'No, use a different password for each important account', 'Only on weekends'],
        'Na u lokela ho sebelisa phasewete e le \'ngoe bakeng sa li-akhaonte tsohle?', ['E, kamehla', 'Bakeng sa li-akhaonte tsa banka feela', 'Che, sebelisa phasewete e fapaneng bakeng sa akhaonte e \'ngoe le e \'ngoe ea bohlokoa', 'Mafelong a beke feela'], 2),
      Q('What is two-step verification?', ['An extra check, such as a code sent to your phone', 'A type of virus', 'A printer setting', 'A free app'],
        'Netefatso ea mehato e \'meli ke eng?', ['Tlhahlobo e eketsehileng, joalo ka khoutu e romeloang mohaleng oa hau', 'Mofuta oa vaerase', 'Tlhophiso ea printa', 'App ea mahala'], 0),
      Q('Before you confirm a mobile money payment, you should:', ['Send it twice to be sure', 'Share your PIN with the agent', 'Turn off your phone', 'Check the name and number'],
        'Pele u tiisa tefo ea chelete ea mohala, u lokela ho:', ['E romela habeli ho netefatsa', 'Arolelana PIN ea hau le moemeli', 'Tima mohala oa hau', 'Sheba lebitso le nomoro'], 3)
    ],
    post: [
      Q('Which password is the strongest?', ['123456', 'thabo', 'T7!river#Lesotho29', 'password'],
        'Ke phasewete efe e matla ka ho fetisisa?', ['123456', 'thabo', 'T7!river#Lesotho29', 'password'], 2),
      Q('Who should you share your PIN with?', ['Your bank agent', 'A friend', 'Nobody', 'The caller'],
        'U lokela ho arolelana PIN ea hau le mang?', ['Moemeli oa banka ea hau', 'Motsoalle', 'Ha ho motho', 'Motho ea u letsetsang'], 2),
      Q('A message says you won a prize but must send money first. This is:', ['A real prize', 'A likely scam', 'A bank rule', 'A free gift'],
        'Molaetsa o re u hapile moputso empa u tlameha ho romela chelete pele. Sena ke:', ['Moputso oa \'nete', 'Bomenemene bo ka khonehang', 'Molao oa banka', 'Mpho ea mahala'], 1),
      Q('What should you do on a shared computer after using your email?', ['Leave it open', 'Log out', 'Write your password on the screen', 'Nothing'],
        'U lokela ho etsa eng khomphuteng e sebelisoang ke batho ba bangata ka mor\'a ho sebelisa imeile ea hau?', ['E siee e butsoe', 'Tsoa (Log out)', 'Ngola phasewete ea hau skrining', 'Ha ho letho'], 1)
    ]
  }
];
