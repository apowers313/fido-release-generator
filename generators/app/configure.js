module.exports = {
  vars: create_derived_vars,
  template: create_template_dir,
  github: clone_from_github
};

function create_derived_vars() {
  this.tag =
    "fido" + "-" +
    this.answers.specset + "-" +
    "v" + this.answers.specversion + "-" +
    this.answers.specstatus + "-" +
    ((this.answers.tagaddon.length > 0) ? (this.answers.tagaddon + "-") : ("")) +
    this.answers.tagdate +
    "";
  this.log.debug("Config Tag:", this.tag);
  // $targetVersion = "v" . $targetVersion;

  // my $specStatusUC = uc($specStatus);    # uc == uppercase

  // my $publishYear  = substr $publishDate, 0, 4;
  // my $publishMonth = substr $publishDate, 4, 2;
  // my $publishDay   = substr $publishDate, 6, 2;

  // my $versionLabel = $targetVersion . "-" . $specStatus . "-" . $publishDate;

  // my $tagMessage =
  //   $specSet . "-" . $versionLabel . " spec set snapshot creation.";

  
  switch (this.answers.specstatus) {
    case "wd":
      this.answers.specphrase = "Working Draft (Work in progress)"; break;
    case "rd":
      this.answers.specphrase = "Review Draft (Work in progress)"; break;
    case "id":
      this.answers.specphrase = "Implemenation Draft (Work in progress)"; break;
    case "ps":
      this.answers.specphrase = "Proposed Standard";
  }

  //my $versionLabel = $targetVersion . "-" . $specStatus . "-" . $publishDate;

  this.test = this.answers.test;
}

function create_template_dir() {

}

function clone_from_github() {
  // TODO: clone into template directory
  // this.sourceRoot('new/template/path')

  // don't clone if just testing
  if (this.test) {
    this.log.warn("TEST: not cloning from github");
    return;
  }

  //git clone --recursive https://github.com/$githubAcnt/$specSet-specs
  //git clone --recursive https://github.com/$githubAcnt/common-specs
  //git clone --recursive https://github.com/$githubAcnt/resources
}