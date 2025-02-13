// domaincheck
import { readFile, writeFile } from 'node:fs/promises';
import { execute } from './lib/execute.js';


// lookup values
const nameserver = {
  'awsdns': 'AWS Route53',
  'bodis': 'Dynadot',
  'cloudflare': 'Cloudflare',
  'domaincontrol': 'Wild West Domains',
  'domainsure': 'DomainSure',
  'easydns': 'EasyDNS',
  'emailverification': 'Key-Systems GmbH',
  'epag': 'EPAG Domainservices GmbH',
  'google': 'Google',
  'hetzner': 'Hetzner',
  'hostpoint': 'Hostpoint AG',
  'iwantmyname': '1API GmbH',
  'kanvaslabs': 'Tucows',
  'mailspamprotection': 'Tucows',
  'registrar-servers': 'NameCheap',
  'second-ns': 'Hetzner',
  'systemdns': 'Tucows',
  'wixdns': 'Wix',
};

// processing functions
const dnsProcess = [

  // process nameserver
  ns => {
    return lookup(nameserver, ns) || first(ns);
  },

  // process website
  web => {
    return first(web);
  },

  // process MX
  mx => {
    return lookup(nameserver, mx) || first(mx);
  },

  // process SPF
  spf => {
    if (!spf) return '';
    return spf.split('\n').find(s => s.includes('v=spf'));
  },

  // process DKIM
  dkim => {
    if (!dkim) return '';
    return dkim.split('\n').find(s => s.includes('v=DKIM')) ? 'DKIM' : '';
  },

  // process DMARC
  dmarc => {
    if (!dmarc) return '';
    return dmarc.split('\n').find(s => s.includes('v=DMARC'));
  },

];


// read domains
const domain = (await readFile( 'domains.txt', { encoding: 'utf8' } ))
  .split('\n')
  .map(fn => fn.trim())
  .filter(fn => fn && !fn.startsWith('#'));


// output
let output = '';

// process all domains
for (let f = 0; f < domain.length; f++) {

  const d = domain[f];
  console.log(d);

  const result = (await Promise.allSettled([
    execute('dig', ['NS', d, '+short']),                          // nameserver
    execute('dig', ['www.' + d, '+short']),                       // website
    execute('dig', ['MX', d, '+short']),                          // MX
    execute('dig', ['TXT', d, '+short']),                         // TXT / SPF
    execute('dig', ['TXT', 'google._domainkey.' + d, '+short']),  // DKIM
    execute('dig', ['TXT', '_dmarc.' + d, '+short']),             // DMARC
  ]))
    .map((r, i) => {

      const v = r.value && r.value.complete ? r.value.result[0] : '';
      return dnsProcess?.[i] ? dnsProcess[i](v) : `${ i }: ${ v }`;

    });

  result.unshift(d);
  output += result.join() + '\n';

}

await writeFile('domains.csv', output);


// return value found in list
function lookup(list, str) {

  if (!str) return '';

  let flen = 0, found = '';
  for( const [find, value] of Object.entries(list) ) {
    if (find.length > flen && str.includes(find)) {
      found = value;
      flen = find.length;
    }
  }

  return found;

}


// get first value
function first(str) {
  if (!str) return '';
  return str.split('\n').shift();
}
