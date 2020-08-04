import { API, FileInfo, ImportDeclaration, Specifier } from 'jscodeshift';

const isKindImportSpecifier = (specifier: Specifier) =>
  specifier.type === 'ImportSpecifier';

export default function (fileInfo: FileInfo, api: API) {
  api
    .jscodeshift(fileInfo.source)
    .find(ImportDeclaration)
    .filter((path) => path.node.source.value === '@material-ui/code')
    .map((path) => {
      const kindImportSpecifiers = path.node.specifiers.filter(
        isKindImportSpecifier,
      );
      const defaultAndNamespaceImportSpecifiers = path.node.specifiers.filter(
        (specifier) => !isKindImportSpecifier(specifier),
      );

      return [
        api.jscodeshift.importDeclaration(
          defaultAndNamespaceImportSpecifiers,
          api.jscodeshift.stringLiteral(path.node.source.value as string),
        ),
        ...kindImportSpecifiers.map((specifier) =>
          api.jscodeshift.importDeclaration(
            [specifier],
            api.jscodeshift.stringLiteral(
              `${path.node.source.value}/${specifier.name}`,
            ),
          ),
        ),
      ];
    });
}
