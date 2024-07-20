
import nwBuilder from 'nw-builder'


nwBuilder({
    srcDir: './server/',
    mode: "build",
    glob:  false

}).then(()  => {
    console.log('DONE');

}
).catch((error) => {
    console.error(error)
})