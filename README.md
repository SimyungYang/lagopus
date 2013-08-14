# Lagopus

Alopex Runtime을 위한 간단한 명령어 도구입니다

## Alopex Runtime을 위한 간단한 명령어 도구 

![Alopex Lagopus](http://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Polarfuchs_1_2004-11-17.jpg/220px-Polarfuchs_1_2004-11-17.jpg)

Arctic Fox: 북극 여우. 학명: [Alopex Lagopus](http://en.wikipedia.org/wiki/Arctic_fox)

- 이클립스 플러그인은 이제 그만. **쉘 스크립트**로 Alopex Runtime 개발을 해봅시다.
- Lagopus는 북극여우의 학명 Alopex Lagopus에서 따왔습니다.
- Static Site Generator인 Punch([https://github.com/laktek/punch](https://github.com/laktek/punch))의 구조에서 많은 부분을 차용하였습니다.
	- Thanks to [Lakshan Perera](https://github.com/laktek)
- Java 서블릿을 통한 템플릿 엔진인 Apache Tiles와 흡사한 기능의 가능성을 깨우쳐 준 [Express](http://expressjs.com)에 경의를 표합니다.

### Version
0.0.5

### Lagopus Feature(Prototype)

- Alopex Runtime 프로젝트 구조 생성하기
- 시뮬레이터를 위한 웹서버 띄우기
- 템플릿 기능을 통한 실시간 HTML 컴포지션
- 템플릿으로 컴포지션된 결과 HTML을 생성하기
- 자바스크립트 난독화/압축

### TODO

- 코드 다듬기 및 설정(config)
- 생성 작업이 끝난 후 압축파일 만들기(generate POST process. generator hook)
- deploy 기능(O&M에 자동으로 zip 업로드 및 배포. 이건 generate보다는 deploy로 아예 빼는 게 낫겠다)
- CSS 압축
- Lightweight 컨텐츠 서버: Timestamp를 버전으로 하여 변경된 컨텐츠만 on-demand compressing하여 제공합니다.(이게 대박)
- 커스터마이징(설정파일 등)을 통해 패키징, 템플릿팅 등의 기능을 직접 구현할 수 있습니다.
- pre comile: SaSS, LESS, CoffeeScript등..
- 설정에서 원하는 스크립트, CSS등을 골라서 묶기. 여러개의 generate profile 관리할 수 있도록 하기(generate profile 좋네)
- 국제화. 미리 국제화하여 generation(언어별로)할 수 있는 기능.


### Getting Started

- Node.js가 설치되어 있지 않다면 설치합니다. [http://nodejs.org/#download](http://nodejs.org/#download)
- 설치는 `npm install -g lagopus` 로 합니다.
- 만들고 싶은 디렉토리에 들어가서 `lagopus setup mysite`을 수행합니다.
	- 그냥 `lagopus setup`라고 할 경우 해당 디렉토리에 구조가 생성됩니다.
- `cd mysite`로 들어가면 www등의 구조가 보입니다. 해당 디렉토리에서 `lagopus s`를 수행하면 서버가 시작됩니다.
- 브라우저를 열고 [http://localhost:3000/uidef/main.view](http://localhost:3000/uidef/main.view)로 들어가면 템플릿팅된 화면을 확인할 수 있습니다.
	- 템플릿을 사용하려면 template/uidef에 작성하고 *.view로 요청합니다.(시뮬레이터에서 *.html로 요청하는게 깔끔하지 않은가? 이 부분은 협의 필요)
	- 템플릿을 사용하지 않으려면 www/uidef에 직접 작성하고 *.html로 요청합니다.

- `lagopus g` 명령어로 파일 생성 및 패키징을 수행합니다.

### Documentation

가이드 문서는 여기에 있습니다(TODO)


### License

MIT LICENSE
