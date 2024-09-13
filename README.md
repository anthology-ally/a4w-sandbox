# a4w-sandbox
This installation guide is related only for local devel environment. The github pages running for perf environment are
hosted on github. 

## Installation
- disable ZScaler
- install latest Ruby. Inspired by RECOMMENDED way in https://stackoverflow.com/questions/51126403/you-dont-have-write-permissions-for-the-library-ruby-gems-2-3-0-directory-ma
```
brew install chruby ruby-install
ruby-install ruby
``` 
Modify `~/.bash_profile` and append: 
```
  source /opt/homebrew/opt/chruby/share/chruby/chruby.sh
  source /opt/homebrew/opt/chruby/share/chruby/auto.sh
  chruby 3.3.5
```
Hint: To see list of all Ruby versions:
```
cd /Users/<your username>/.rubies
```

## Run locally
```
$ npm install -g yarn
$ gem install bundler
$ bundle install
$ yarn start
```

To update, push a change to master.

Sometimes it just tails to publish, though. For no reason. Did it again.

## Ally integration
### Scala code
To be able to execute crawling on your local dev environment modify these files:
- disable ssl cert. hostname verifier in `io.fronteer.ally.poller.HttpUtil#buildSttpExecutor` add
```
        .hostnameVerifier(new HostnameVerifier() {
          override def verify(hostname: ResourceIdHash, session: SSLSession): Boolean = {
            true
          }
        }
        )
```
- since the sendbox is running on port 4000 and we can't set port for domains group you have to hardcode it in
  `ally.sync.lms.process.CrawlProcess#exec0`. 
   ```
     seedsFromDomains` = domainsToSeeds(domains, ResourceProtocol("https", Option(4000) ) )
  ```

### Client creation
- create a new A4W client using Administrator UI (Main web url = https://127.0.0.1:4000)
- import new domains. Create a new CSV file to import containing one row:
```
"127.0.0.1", "local test domain"
```

### Certificate import
Import certificate from _ssl folder in this project into the Java used for running Ally app. 
```
sudo keytool  -import  -trustcacerts -alias A4w_local -file .../a4w-sandbox/_ssl/selfsigned.crt   -keystore  <your Scala Java Home>/Contents/Home/lib/security/cacerts
```
You can check:
```
keytool -list -keystore <your Scala Java Home>/Contents/Home/lib/security/cacerts  -storepass changeit
```

