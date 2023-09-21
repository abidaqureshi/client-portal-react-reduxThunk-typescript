${
    // Enable extension methods by adding using Typewriter.Extensions.*
    using Typewriter.Extensions.Types;

    string Imports(Class c)
    {
        var types = c.Properties
            .Select(p => p.Type)
            .Where(t => !t.IsPrimitive || t.IsEnum)
            .Select(t => t.IsGeneric ? t.TypeArguments.First() : t)
            .Where(t => t.FullName != t.Name) // filter generics
            .Distinct()
            .Select(t => t.Name.Trim(new char[]{'[',']'}));

        var lines = types.Where(t => !t.Contains('{')).Select(t => $"import {{ {t} }} from './{t}';").Distinct();

        if(c.BaseClass != null) {
            lines = new string[]{Imports(c.BaseClass)}.Concat(lines);
        }

        return string.Join(Environment.NewLine, lines);
    }

    string PropType(Property t) 
    {
        if(t.Type.Name == "Date") return "string";
        return t.Type.Name;
    }

    string Extends(Class c) {
        if(c.BaseClass?.Name != null) {
            return " extends "+c.BaseClass.Name;
        }
        return "";
    }

    bool IsOptional(Property p) => p.Attributes.Any(a => a.Name == "Optional");
}
$Classes(WhichPharmaPortal.Models.Client.*)[$Imports

export interface $Name$TypeParameters { $BaseClass[$Properties[
    $name$IsOptional[?]: $PropType;]]$Properties[
    $name$IsOptional[?]: $PropType;]
}]